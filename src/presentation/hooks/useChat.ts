import {useState, useEffect, useCallback, useRef} from "react";
import {useAuth} from "./useAuth";
import ChatService from "../../core/services/ChatService";
import type {Chat, Message} from "../../core/domain/entities/Chat";
import { extractErrorMessage } from "../../utils/errorHandler";
import { is } from "date-fns/locale";

export const useChat = (isSeller = false) => {
	const [chats, setChats] = useState<Chat[]>([]);
	const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// Referencias para controlar peticiones y estado
	const isLoadingRef = useRef(false);
	const chatFetchAttempts = useRef<Record<number, number>>({});
	const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const localChatsRef = useRef<Chat[]>([]);

	// Mapeo entre IDs temporales y IDs reales del backend
	const temporaryToRealIdMap = useRef<Map<number, number>>(new Map());

	// Obtener el usuario actual del hook de autenticación
	const {user} = useAuth();
	const chatService = new ChatService();

	// Generar un ID temporal único
	const generateTemporaryId = useCallback((): number => {
		return Date.now() + Math.floor(Math.random() * 1000);
	}, []);

	/**
	 * Convierte un ID temporal a un ID real si existe en el mapeo
	 * @param id ID que puede ser temporal o real
	 * @returns ID real si existe o el ID original
	 */
	const resolveRealId = useCallback((id: number): number => {
		const realId = temporaryToRealIdMap.current.get(id);
		if (realId) {
			console.log(`Resolviendo ID temporal ${id} a ID real ${realId}`);
		}
		return realId || id;
	}, []);

	/**
	 * Carga la lista de chats del usuario
	 */
	const fetchChats = useCallback(async () => {
		// Evitar múltiples peticiones simultáneas
		if (isLoadingRef.current) return [];

		try {
			 console.log(
					`🔄 Obteniendo lista de chats ${isSeller ? "como vendedor" : "como usuario"}...`
				);
			isLoadingRef.current = true;
			setLoading(true);
			setError(null);

			const response = await chatService.getChats();

			if (response) {
				let chatsData: Chat[] = [];

				// Extraer chats desde la respuesta, manejando diferentes estructuras
				if (response.data && Array.isArray(response.data)) {
					console.log("Estructura de respuesta: data es un array");
					chatsData = response.data;
				} else if (
					response.data &&
					typeof response.data === "object" &&
					response.data.data &&
					Array.isArray(response.data.data)
				) {
					console.log("Estructura de respuesta: data.data es un array");
					chatsData = response.data.data;
				} else if (Array.isArray(response)) {
					console.log("Estructura de respuesta: respuesta directa es un array");
					chatsData = response;
				} else {
					console.warn("Estructura de respuesta no reconocida:", response);
					chatsData = [];
				}

				console.log(`✅ Se encontraron ${chatsData.length} chats`);

				// Procesar los chats obtenidos
				if (chatsData.length > 0) {
					// Log para diagnóstico
					console.log(
						"Primer chat recibido:",
						JSON.stringify(chatsData[0], null, 2)
					);

					const processedChats = chatsData.map((chat: any) => {
						// Si no tiene ID, asignar uno temporal (solo para desarrollo)
						if (!chat.id) {
							console.warn("⚠️ Chat recibido sin ID, asignando ID temporal");
							chat.id = generateTemporaryId();
						}

						// Normalizar los nombres de las propiedades (según interfaz Chat)
						const normalizedChat: Chat = {
							id: chat.id,
							userId: chat.user_id || chat.userId || 0,
							sellerId: chat.seller_id || chat.sellerId || 0,
							productId: chat.product_id || chat.productId || 0,
							status: chat.status || "active",
							messages: chat.messages || [],
							createdAt: chat.created_at || chat.createdAt,
							updatedAt: chat.updated_at || chat.updatedAt,
							user: chat.user,
							product: chat.product,
							unreadCount: chat.unread_count || chat.unreadCount || 0,
							lastMessage: chat.last_message || chat.lastMessage,
						};

						// Marcar los mensajes como propios según si es vendedor o no
						if (normalizedChat.messages && normalizedChat.messages.length > 0) {
							normalizedChat.messages = normalizedChat.messages.map(
								(message) => ({
									...message,
									isMine: isSeller
										? message.senderId === normalizedChat.sellerId
										: message.senderId === normalizedChat.userId,
								})
							);
						}

						return normalizedChat;
					});

					console.log(`💬 Chats procesados: ${processedChats.length}`);
					setChats(processedChats);
					localChatsRef.current = processedChats;
					return processedChats;
				} else {
					console.log("No se encontraron chats");
					setChats([]);
					localChatsRef.current = [];
					return [];
				}
			} else {
				console.warn("Respuesta vacía o inválida");
				setError(
					"Error al cargar los chats. La respuesta del servidor es inválida."
				);
				return [];
			}
		} catch (err) {
			console.error("Error al obtener chats:", err);
			setError(extractErrorMessage(err, "Error al cargar los chats"));
			return [];
		} finally {
			setLoading(false);
			isLoadingRef.current = false;
		}
	}, [user?.id, generateTemporaryId, isSeller]);

	/**
	 * Carga los mensajes de un chat específico
	 */
	const fetchChatMessages = useCallback(
		async (chatId: number) => {
			// Resolver el ID real si es temporal
			const resolvedChatId = resolveRealId(chatId);

			// Verificar si el chat existe y si ya se ha intentado cargar demasiadas veces
			const attempts = chatFetchAttempts.current[resolvedChatId] || 0;
			if (attempts > 2) {
				console.warn(
					`Demasiados intentos para cargar el chat ${resolvedChatId}, abortando`
				);
				setError(`No se pudo cargar el chat. Intente más tarde.`);

				// Detener el polling si está activo para este chat
				if (refreshIntervalRef.current) {
					console.log(
						`Deteniendo polling para chat ${resolvedChatId} por demasiados intentos fallidos`
					);
					clearInterval(refreshIntervalRef.current);
					refreshIntervalRef.current = null;
				}

				return null;
			}

			try {
				// Evitar múltiples peticiones simultáneas
				if (isLoadingRef.current) {
					console.log(
						`Petición bloqueada para chat ${resolvedChatId}, ya hay una en curso`
					);
					return null;
				}

				console.log(`Cargando mensajes para chat ${resolvedChatId}...`);
				isLoadingRef.current = true;
				setLoading(true);
				setError(null);

				// Incrementar contador de intentos
				chatFetchAttempts.current[resolvedChatId] = attempts + 1;

				// Si el ID es temporal, verificar si ya tenemos el chat en caché
				if (
					temporaryToRealIdMap.current.has(chatId) ||
					chatId !== resolvedChatId
				) {
					// Este es un ID temporal o un ID que ya hemos mapeado
					// Buscar en la caché primero
					const cachedChat = localChatsRef.current.find(
						(c) => c.id === resolvedChatId
					);
					if (cachedChat) {
						setSelectedChat(cachedChat);
						if (cachedChat.messages && cachedChat.messages.length > 0) {
							setMessages(cachedChat.messages);
							// Reiniciar contador de intentos al tener éxito
							chatFetchAttempts.current[resolvedChatId] = 0;
							return cachedChat;
						}
					}
				}

				// Intentar cargar desde el servidor solo si es un ID real (no temporal)
				if (chatId === resolvedChatId) {
					try {
						const response = await chatService.getChatDetails(resolvedChatId);

						if (response && response.status === "success") {
							// Procesar chat y mensajes - verificando que no sean vacíos
							let chat = response.data?.chat;
							let responseMessages = response.data?.messages || [];

							// Manejar diferentes estructuras de respuesta
							if (!chat && response.data) {
								// Si no hay chat específico pero hay datos, intentar extraer el chat
								if (
									typeof response.data === "object" &&
									"id" in response.data
								) {
									chat = response.data;
								}
							}

							if (
								!Array.isArray(responseMessages) &&
								response.data &&
								Array.isArray(response.data.data)
							) {
								responseMessages = response.data.data;
							}

							// Validar que el chat tenga ID
							if (chat && chat.id) {
								console.log(
									`Chat ${resolvedChatId} cargado correctamente con ${responseMessages.length} mensajes`
								);

								// Reiniciar contador de intentos al tener éxito
								chatFetchAttempts.current[resolvedChatId] = 0;

								// Normalizar propiedades
								const normalizedChat: Chat = {
									id: chat.id,
									userId: chat.user_id || chat.userId || 0,
									sellerId: chat.seller_id || chat.sellerId || 0,
									productId: chat.product_id || chat.productId || 0,
									status: chat.status || "active",
									messages: chat.messages || [],
									createdAt: chat.created_at || chat.createdAt,
									updatedAt: chat.updated_at || chat.updatedAt,
									user: chat.user,
									product: chat.product,
									unreadCount: chat.unread_count || chat.unreadCount || 0,
									lastMessage: chat.last_message || chat.lastMessage,
								};

								// Marcar los mensajes como propios o no
								const chatMessages = responseMessages.map((message: any) => ({
									...message,
									isMine: isSeller
										? message.senderId === selectedChat?.sellerId ||
											message.sender_id === selectedChat?.sellerId
										: message.senderId === user?.id ||
											message.sender_id === user?.id,
								}));

								// Actualizar estados
								setSelectedChat(normalizedChat);
								setMessages(chatMessages);

								// Añadir este chat a la lista si no existe
								setChats((prevChats) => {
									const exists = prevChats.some((c) => c.id === chat.id);
									if (!exists) {
										const updatedChats = [...prevChats, normalizedChat];
										localChatsRef.current = updatedChats;
										return updatedChats;
									}

									const updatedChats = prevChats.map((c) =>
										c.id === normalizedChat.id ? {...c, ...normalizedChat} : c
									);
									localChatsRef.current = updatedChats;
									return updatedChats;
								});

								return normalizedChat;
							} else {
								console.error(
									`Chat ${resolvedChatId} no tiene un formato válido:`,
									chat
								);
								setError("Chat no encontrado o sin acceso");
								return null;
							}
						} else {
							console.error(
								`Error en respuesta para chat ${resolvedChatId}:`,
								response
							);
							setError("Error al cargar los mensajes");
							return null;
						}
					} catch (err) {
						console.error(
							`Error al obtener mensajes del chat ${resolvedChatId}:`,
							err
						);
						// Si el error es 404, es posible que el chat no exista en el servidor
						const isNotFound =
							err &&
							typeof err === "object" &&
							"response" in err &&
							(err as any).response?.status === 404;

						if (isNotFound) {
							// Puede ser un chat temporal o que se eliminó en el servidor
							// Manejarlo de forma elegante sin mostrar error al usuario
							console.warn(
								`Chat ${resolvedChatId} no encontrado en el servidor`
							);
							setError(null);

							// Detener el polling si está activo para este chat
							if (refreshIntervalRef.current) {
								console.log(
									`Deteniendo polling para chat ${resolvedChatId} por error 404`
								);
								clearInterval(refreshIntervalRef.current);
								refreshIntervalRef.current = null;
							}

							// Eliminar de la lista si existe
							setChats((prevChats) => {
								const updatedChats = prevChats.filter(
									(c) => c.id !== resolvedChatId
								);
								localChatsRef.current = updatedChats;
								return updatedChats;
							});

							return null;
						} else {
							setError(
								extractErrorMessage(err, "Error al cargar los mensajes")
							);
							return null;
						}
					}
				} else {
					// Si es un ID temporal y no tenemos datos en caché, no podemos hacer mucho
					console.warn(`No se pudo cargar el chat con ID temporal ${chatId}`);
					setError("El chat aún no ha sido sincronizado con el servidor");
					return null;
				}
			} finally {
				isLoadingRef.current = false;
				setLoading(false);
			}
		},
		[user?.id, resolveRealId, isSeller]
	);

	/**
	 * Crea un nuevo chat con un vendedor para un producto
	 */
	const createChat = useCallback(
		async (sellerId: number, productId: number) => {
			if (isLoadingRef.current) {
				console.log("Creación bloqueada, hay una operación en curso");
				return null;
			}

			try {
				console.log(
					`Creando chat con vendedor ${sellerId} para producto ${productId}...`
				);
				isLoadingRef.current = true;
				setLoading(true);
				setError(null);

				// Generar un ID temporal para el nuevo chat
				const tempChatId = generateTemporaryId();

				// Crear un chat temporal en la interfaz mientras esperamos respuesta del servidor
				const tempChat: Chat = {
					id: tempChatId,
					userId: user?.id || 0,
					sellerId: sellerId,
					productId: productId,
					status: "active",
					messages: [],
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};

				// Añadir el chat temporal a la lista
				setChats((prevChats) => {
					const updatedChats = [...prevChats, tempChat];
					localChatsRef.current = updatedChats;
					return updatedChats;
				});

				// Ahora enviamos la petición al servidor
				const response = await chatService.createChat({
					seller_id: sellerId,
					product_id: productId,
				});

				if (response.status === "success" && response.data?.chat_id) {
					console.log("Chat creado correctamente:", response.data);
					const realChatId = response.data.chat_id;

					// Mapear ID temporal al ID real
					temporaryToRealIdMap.current.set(tempChatId, realChatId);
					console.log(
						`Chat creado con éxito. ID temporal: ${tempChatId}, ID real: ${realChatId}`
					);

					// Actualizar el chat en la lista con el ID real
					setChats((prevChats) => {
						const updatedChats = prevChats.map((chat) =>
							chat.id === tempChatId ? {...chat, id: realChatId} : chat
						);
						localChatsRef.current = updatedChats;
						return updatedChats;
					});

					// Actualizar el chat seleccionado si es el mismo
					if (selectedChat?.id === tempChatId) {
						setSelectedChat((prev) =>
							prev ? {...prev, id: realChatId} : null
						);
					}

					return realChatId;
				} else {
					console.error("Error en respuesta al crear chat:", response);

					// Eliminar el chat temporal en caso de error
					setChats((prevChats) => {
						const updatedChats = prevChats.filter(
							(chat) => chat.id !== tempChatId
						);
						localChatsRef.current = updatedChats;
						return updatedChats;
					});

					setError(response.message || "Error al crear el chat");
					return null;
				}
			} catch (err) {
				console.error("Error al crear chat:", err);
				setError(extractErrorMessage(err, "Error al crear el chat"));
				return null;
			} finally {
				isLoadingRef.current = false;
				setLoading(false);
			}
		},
		[user, generateTemporaryId, selectedChat]
	);

	/**
	 * NUEVA FUNCIÓN: Enviar mensaje a un chat recién creado (sin requerir selectedChat)
	 */
	const sendMessageForNewChat = useCallback(
		async (chatId: number, content: string): Promise<boolean> => {
			// Resolver el ID real si es temporal
			const resolvedChatId = resolveRealId(chatId);

			if (!resolvedChatId || !content.trim()) {
				console.error("No se puede enviar mensaje: Chat ID o contenido vacío");
				return false;
			}

			if (isLoadingRef.current) {
				console.log("Envío bloqueado, hay una operación en curso");
				return false;
			}

			try {
				console.log(`Enviando mensaje al nuevo chat ${resolvedChatId}...`);
				isLoadingRef.current = true;
				setLoading(true);
				setError(null);

				// Crear un mensaje temporal para mostrar inmediatamente
				const tempMessage: Message = {
					id: generateTemporaryId(),
					chatId: resolvedChatId,
					senderId: user?.id || 0,
					content: content.trim(),
					isRead: false,
					isMine: true,
					createdAt: new Date().toISOString(),
				};

				// Añadir mensaje temporal a la lista
				setMessages((prev) => [...prev, tempMessage]);

				// Actualizar el último mensaje del chat en la lista
				setChats((prev) =>
					prev.map((chat) => {
						if (chat.id === chatId || chat.id === resolvedChatId) {
							return {
								...chat,
								lastMessage: tempMessage,
								updatedAt: new Date().toISOString(),
							};
						}
						return chat;
					})
				);

				try {
					const response = await chatService.sendMessage(resolvedChatId, {
						content: content.trim(),
					});

					if (response.status === "success") {
						console.log(
							"Mensaje para nuevo chat enviado correctamente:",
							response.data
						);

						// Reemplazar el mensaje temporal con el real
						if (response.data && response.data.message) {
							setMessages((prev) =>
								prev.map((msg) =>
									msg.id === tempMessage.id
										? {...response.data.message, isMine: true}
										: msg
								)
							);
						}

						// Refrescar chat para sincronizar
						await fetchChatMessages(resolvedChatId);
						return true;
					} else {
						console.error("Error en respuesta al enviar mensaje:", response);

						// Eliminar el mensaje temporal en caso de error
						setMessages((prev) =>
							prev.filter((msg) => msg.id !== tempMessage.id)
						);

						setError(response.message || "Error al enviar el mensaje");
						return false;
					}
				} catch (err) {
					// Verificar si el error es un 404 - Chat no encontrado
					const isNotFound =
						err &&
						typeof err === "object" &&
						"response" in err &&
						(err as any).response?.status === 404;

					if (isNotFound) {
						console.warn(
							`El chat ${resolvedChatId} no existe en el servidor, no se pudo enviar el mensaje`
						);

						// Limpiar el mensaje temporal
						setMessages((prev) =>
							prev.filter((msg) => msg.id !== tempMessage.id)
						);

						setError(
							"El chat no existe en el servidor. Intente crear un nuevo chat."
						);

						// Limpiar el mapeo si era un ID temporal
						if (resolvedChatId !== chatId) {
							temporaryToRealIdMap.current.delete(chatId);
						}

						return false;
					}

					// Para otros errores
					console.error("Error al enviar mensaje a nuevo chat:", err);

					// Limpiar el mensaje temporal
					setMessages((prev) =>
						prev.filter((msg) => msg.id !== tempMessage.id)
					);

					setError(extractErrorMessage(err, "Error al enviar el mensaje"));
					return false;
				}
			} finally {
				isLoadingRef.current = false;
				setLoading(false);
			}
		},
		[fetchChatMessages, user?.id, resolveRealId, generateTemporaryId]
	);

	/**
	 * Envía un mensaje al chat seleccionado
	 */
	const sendMessage = useCallback(
		async (content: string): Promise<boolean> => {
			if (!selectedChat || !selectedChat.id || !content.trim()) {
				console.error(
					"No se puede enviar mensaje: Chat no seleccionado o contenido vacío"
				);
				return false;
			}

			// Resolver el ID real del chat seleccionado
			const resolvedChatId = resolveRealId(selectedChat.id);

			if (isLoadingRef.current) {
				console.log("Envío bloqueado, hay una operación en curso");
				return false;
			}

			try {
				console.log(
					`Enviando mensaje a chat ${resolvedChatId} ${isSeller ? "como vendedor" : "como usuario"}...`
				);
				isLoadingRef.current = true;
				setLoading(true);
				setError(null);

				// Identificar qué ID usar como senderId según el rol
				const senderId = isSeller ? selectedChat.sellerId : user?.id;

				// Crear un mensaje temporal para mostrar inmediatamente
				const tempMessage: Message = {
					id: generateTemporaryId(),
					chatId: resolvedChatId,
					senderId: senderId || 0,
					content: content.trim(),
					isRead: false,
					isMine: true,
					createdAt: new Date().toISOString(),
				};

				// Añadir mensaje temporal a la lista
				setMessages((prev) => [...prev, tempMessage]);

				try {
					const response = await chatService.sendMessage(resolvedChatId, {
						content: content.trim(),
					});

					if (response.status === "success") {
						console.log("Mensaje enviado correctamente:", response.data);

						// Reemplazar el mensaje temporal con el real
						if (response.data && response.data.message) {
							setMessages((prev) =>
								prev.map((msg) =>
									msg.id === tempMessage.id
										? {...response.data.message, isMine: true}
										: msg
								)
							);
						}

						// Actualizar el último mensaje en la lista de chats
						setChats((prev) =>
							prev.map((chat) => {
								if (chat.id === selectedChat.id || chat.id === resolvedChatId) {
									return {
										...chat,
										lastMessage: response.data.message || tempMessage,
										updatedAt: new Date().toISOString(),
									};
								}
								return chat;
							})
						);

						return true;
					} else {
						console.error("Error en respuesta al enviar mensaje:", response);

						// Eliminar el mensaje temporal en caso de error
						setMessages((prev) =>
							prev.filter((msg) => msg.id !== tempMessage.id)
						);

						setError(response.message || "Error al enviar el mensaje");
						return false;
					}
				} catch (err) {
					// Verificar si el error es un 404 - Chat no encontrado
					const isNotFound =
						err &&
						typeof err === "object" &&
						"response" in err &&
						(err as any).response?.status === 404;

					if (isNotFound) {
						console.warn(
							`El chat ${resolvedChatId} no existe en el servidor, no se pudo enviar el mensaje`
						);

						// Eliminar el mensaje temporal
						setMessages((prev) =>
							prev.filter((msg) => msg.id !== tempMessage.id)
						);

						setError(
							"El chat no existe en el servidor. Intente crear un nuevo chat."
						);

						// Detener polling si existe
						if (refreshIntervalRef.current) {
							console.log(
								`Deteniendo polling para chat inexistente ${resolvedChatId}`
							);
							clearInterval(refreshIntervalRef.current);
							refreshIntervalRef.current = null;
						}

						return false;
					}

					console.error("Error al enviar mensaje:", err);

					// Eliminar mensaje temporal en caso de error
					setMessages((prev) =>
						prev.filter((msg) => msg.id !== tempMessage.id)
					);

					setError(extractErrorMessage(err, "Error al enviar el mensaje"));
					return false;
				}
			} finally {
				isLoadingRef.current = false;
				setLoading(false);
			}
		},
		[selectedChat, user?.id, resolveRealId, generateTemporaryId, isSeller]
	);

	/**
	 * Actualiza el estado de un chat (cerrar, archivar, reabrir)
	 */
	const updateChatStatus = useCallback(
		async (chatId: number, status: "active" | "closed" | "archived") => {
			// Resolver el ID real si es temporal
			const resolvedChatId = resolveRealId(chatId);

			if (isLoadingRef.current) {
				console.log("Actualización bloqueada, hay una operación en curso");
				return false;
			}

			try {
				console.log(
					`Actualizando estado de chat ${resolvedChatId} a ${status}...`
				);
				isLoadingRef.current = true;
				setLoading(true);
				setError(null);

				// Actualizar optimistamente el estado en la UI mientras esperamos respuesta
				setChats((prev) =>
					prev.map((chat) => {
						if (chat.id === chatId || chat.id === resolvedChatId) {
							return {...chat, status};
						}
						return chat;
					})
				);

				if (
					selectedChat &&
					(selectedChat.id === chatId || selectedChat.id === resolvedChatId)
				) {
					setSelectedChat((prev) => (prev ? {...prev, status} : null));
				}

				try {
					const response = await chatService.updateChatStatus(resolvedChatId, {
						status,
					});

					if (response.status === "success") {
						console.log("Estado actualizado correctamente:", response.data);
						return true;
					} else {
						console.error("Error en respuesta al actualizar estado:", response);

						// Revertir cambios en la UI
						await fetchChats();

						setError(
							response.message ||
								`Error al ${status === "active" ? "reabrir" : status === "closed" ? "cerrar" : "archivar"} el chat`
						);
						return false;
					}
				} catch (err) {
					// Verificar si el error es un 404 - Chat no encontrado
					const isNotFound =
						err &&
						typeof err === "object" &&
						"response" in err &&
						(err as any).response?.status === 404;

					if (isNotFound) {
						console.warn(
							`El chat ${resolvedChatId} no existe en el servidor, no se pudo actualizar el estado`
						);

						setError("El chat no existe en el servidor");

						// Revertir cambios locales mediante recarga de chats
						await fetchChats();

						// Detener polling si existe
						if (refreshIntervalRef.current) {
							console.log(
								`Deteniendo polling para chat inexistente ${resolvedChatId}`
							);
							clearInterval(refreshIntervalRef.current);
							refreshIntervalRef.current = null;
						}

						return false;
					}

					console.error(
						`Error al actualizar estado del chat ${resolvedChatId}:`,
						err
					);

					// Revertir cambios en la UI
					await fetchChats();

					setError(
						extractErrorMessage(
							err,
							`Error al ${status === "active" ? "reabrir" : status === "closed" ? "cerrar" : "archivar"} el chat`
						)
					);
					return false;
				}
			} finally {
				isLoadingRef.current = false;
				setLoading(false);
			}
		},
		[selectedChat, fetchChats, resolveRealId]
	);

	// NUEVA FUNCIÓN: Iniciar actualización periódica de mensajes
	const startMessagesPolling = useCallback(
		(chatId: number, intervalMs = 15000) => {
			// Resolver el ID real si es temporal
			const resolvedChatId = resolveRealId(chatId);

			// Limpiar cualquier intervalo existente
			if (refreshIntervalRef.current) {
				clearInterval(refreshIntervalRef.current);
				refreshIntervalRef.current = null;
			}

			// Reiniciar contador de intentos al iniciar nuevo polling
			chatFetchAttempts.current[resolvedChatId] = 0;

			console.log(`Iniciando polling para chat ${resolvedChatId}...`);

			// Crear un nuevo intervalo para el chat específico
			refreshIntervalRef.current = setInterval(() => {
				// Solo actualizar si no hay otra petición en curso
				if (!isLoadingRef.current && resolvedChatId) {
					console.log(
						`Actualizando mensajes del chat ${resolvedChatId} (polling)...`
					);
					fetchChatMessages(resolvedChatId);
				}
			}, intervalMs);

			return () => {
				if (refreshIntervalRef.current) {
					clearInterval(refreshIntervalRef.current);
					refreshIntervalRef.current = null;
				}
			};
		},
		[fetchChatMessages, resolveRealId]
	);

	// Detener el polling al desmontar
	const stopMessagesPolling = useCallback(() => {
		if (refreshIntervalRef.current) {
			clearInterval(refreshIntervalRef.current);
			refreshIntervalRef.current = null;
			console.log("Polling de mensajes detenido");
		}
	}, []);

	// Cargar chats al montar el componente, solo una vez
	useEffect(() => {
		const controller = new AbortController();

		if (user?.id) {
			fetchChats();
		}

		return () => {
			controller.abort();
			// Asegurarse de que no quedan referencias de carga activas
			isLoadingRef.current = false;
			// Detener cualquier polling activo
			stopMessagesPolling();
			// Limpiar estados al desmontar
			setChats([]);
			setSelectedChat(null);
			setMessages([]);
		};
	}, [user?.id, fetchChats, stopMessagesPolling]);

	// Exponer un método para actualizar selectedChat directamente
	const selectChat = useCallback(
		(chat: Chat | null) => {
			if (!chat) {
				console.log("Seleccionando chat: null");
				setSelectedChat(null);
				setMessages([]);
				stopMessagesPolling();
				return;
			}

			console.log("Seleccionando chat:", chat);
			setSelectedChat(chat);

			if (chat && chat.id) {
				// Resolver el ID real si es temporal
				const resolvedChatId = resolveRealId(chat.id);
				fetchChatMessages(resolvedChatId);
				// Iniciar polling de mensajes
				startMessagesPolling(resolvedChatId);
			}
		},
		[
			fetchChatMessages,
			startMessagesPolling,
			stopMessagesPolling,
			resolveRealId,
		]
	);

	/**
	 * Marca todos los mensajes de un chat como leídos
	 */
	const markAllAsRead = useCallback(
		async (chatId: number): Promise<boolean> => {
			if (!chatId) {
				console.error(
					"No se puede marcar mensajes como leídos: ID de chat no válido"
				);
				return false;
			}

			// Resolver el ID real si es temporal
			const resolvedChatId = resolveRealId(chatId);

			try {
				console.log(
					`Marcando todos los mensajes del chat ${resolvedChatId} como leídos...`
				);
				setError(null);

				// Marcar mensajes como leídos localmente de forma optimista
				setMessages((prev) =>
					prev.map((msg) => ({
						...msg,
						isRead: msg.senderId !== user?.id ? true : msg.isRead,
					}))
				);

				// Actualizar el conteo de no leídos en la lista de chats
				setChats((prev) =>
					prev.map((chat) => {
						if (chat.id === chatId || chat.id === resolvedChatId) {
							return {
								...chat,
								unreadCount: 0,
							};
						}
						return chat;
					})
				);

				// Enviar la solicitud al servidor
				const response =
					await chatService.markAllMessagesAsRead(resolvedChatId);

				return response.status === "success";
			} catch (err) {
				console.error(
					`Error al marcar mensajes como leídos en chat ${resolvedChatId}:`,
					err
				);
				setError(
					extractErrorMessage(err, "Error al marcar mensajes como leídos")
				);
				return false;
			}
		},
		[resolveRealId, user?.id, setMessages, setChats, chatService]
	);

	/**
	 * Marca un mensaje específico como leído
	 */
	const markMessageAsRead = useCallback(
		async (chatId: number, messageId: number): Promise<boolean> => {
			if (!chatId || !messageId) {
				console.error("No se puede marcar mensaje como leído: IDs no válidos");
				return false;
			}

			// Resolver el ID real si es temporal
			const resolvedChatId = resolveRealId(chatId);

			try {
				console.log(
					`Marcando mensaje ${messageId} del chat ${resolvedChatId} como leído...`
				);
				setError(null);

				// Marcar mensaje como leído localmente de forma optimista
				setMessages((prev) =>
					prev.map((msg) => {
						if (msg.id === messageId) {
							return {
								...msg,
								isRead: true,
							};
						}
						return msg;
					})
				);

				// Enviar la solicitud al servidor
				const response = await chatService.markMessageAsRead(
					resolvedChatId,
					messageId
				);

				// Actualizar el conteo de no leídos en la lista de chats
				if (response.status === "success") {
					// Recalcular el conteo de no leídos
					const unreadCount = messages.filter(
						(msg) => !msg.isRead && msg.senderId !== user?.id
					).length;

					setChats((prev) =>
						prev.map((chat) => {
							if (chat.id === chatId || chat.id === resolvedChatId) {
								return {
									...chat,
									unreadCount,
								};
							}
							return chat;
						})
					);
				}

				return response.status === "success";
			} catch (err) {
				console.error(
					`Error al marcar mensaje ${messageId} como leído en chat ${resolvedChatId}:`,
					err
				);
				setError(
					extractErrorMessage(err, "Error al marcar mensaje como leído")
				);
				return false;
			}
		},
		[resolveRealId, user?.id, messages, setMessages, setChats, chatService]
	);

	/**
	 * Carga más mensajes con paginación
	 */
	const loadMoreMessages = useCallback(
		async (
			chatId: number,
			page: number,
			limit: number = 20
		): Promise<boolean> => {
			if (!chatId) {
				console.error("No se pueden cargar más mensajes: ID de chat no válido");
				return false;
			}

			if (isLoadingRef.current) {
				console.log("Carga bloqueada, hay una operación en curso");
				return false;
			}

			// Resolver el ID real si es temporal
			const resolvedChatId = resolveRealId(chatId);

			try {
				console.log(
					`Cargando más mensajes para el chat ${resolvedChatId} (página ${page})...`
				);
				isLoadingRef.current = true;
				setLoading(true);
				setError(null);

				// Obtener mensajes paginados
				const response = await chatService.getMessages(
					resolvedChatId,
					page,
					limit
				);

				if (response.status === "success" && response.data.messages) {
					const newMessages = response.data.messages;

					// Marcar mensajes como propios o no
					const processedMessages = newMessages.map((message) => ({
						...message,
						isMine: message.senderId === user?.id,
					}));

					// Agregar mensajes manteniendo el orden y evitando duplicados
					setMessages((prev) => {
						// Crear un mapa de IDs para evitar duplicados
						const messageMap = new Map();
						prev.forEach((msg) => messageMap.set(msg.id, msg));
						processedMessages.forEach((msg) => {
							if (!messageMap.has(msg.id)) {
								messageMap.set(msg.id, msg);
							}
						});

						// Convertir el mapa a array y ordenar por fecha
						const combinedMessages = Array.from(messageMap.values());
						return combinedMessages.sort((a, b) => {
							const dateA = new Date(a.createdAt || 0);
							const dateB = new Date(b.createdAt || 0);
							return dateA.getTime() - dateB.getTime();
						});
					});

					return true;
				}

				return false;
			} catch (err) {
				console.error(
					`Error al cargar más mensajes para el chat ${resolvedChatId}:`,
					err
				);
				setError(extractErrorMessage(err, "Error al cargar más mensajes"));
				return false;
			} finally {
				isLoadingRef.current = false;
				setLoading(false);
			}
		},
		[resolveRealId, user?.id, setMessages, chatService]
	);

	/**
	 * Elimina/archiva un chat
	 */
	const deleteChat = useCallback(
		async (chatId: number): Promise<boolean> => {
			if (!chatId) {
				console.error("No se puede eliminar chat: ID no válido");
				return false;
			}

			// Resolver el ID real si es temporal
			const resolvedChatId = resolveRealId(chatId);

			try {
				console.log(`Eliminando chat ${resolvedChatId}...`);
				setLoading(true);
				setError(null);

				// Actualizar localmente de forma optimista
				setChats((prev) =>
					prev.filter(
						(chat) => chat.id !== chatId && chat.id !== resolvedChatId
					)
				);

				// Si el chat eliminado es el seleccionado, limpiar selección
				if (
					selectedChat &&
					(selectedChat.id === chatId || selectedChat.id === resolvedChatId)
				) {
					setSelectedChat(null);
					setMessages([]);
					stopMessagesPolling();
				}

				// Enviar la solicitud al servidor
				const response = await chatService.deleteChat(resolvedChatId);

				return response.status === "success";
			} catch (err) {
				console.error(`Error al eliminar chat ${resolvedChatId}:`, err);
				setError(extractErrorMessage(err, "Error al eliminar chat"));

				// Revertir cambios si hay error
				await fetchChats();
				return false;
			} finally {
				setLoading(false);
			}
		},
		[
			resolveRealId,
			selectedChat,
			setSelectedChat,
			stopMessagesPolling,
			fetchChats,
			chatService,
		]
	);

	return {
		chats,
		selectedChat,
		messages,
		loading,
		error,
		fetchChats,
		fetchChatMessages,
		sendMessage,
		sendMessageForNewChat,
		createChat,
		updateChatStatus,
		setSelectedChat: selectChat,
		startMessagesPolling,
		stopMessagesPolling,
		markAllAsRead,
		markMessageAsRead,
		loadMoreMessages,
		deleteChat,
	};
};

export default useChat;
