import {useState, useEffect, useCallback, useRef} from "react";
import {useAuth} from "./useAuth";
import ChatService from "../../core/services/ChatService";
import type {Chat, Message} from "../../core/domain/entities/Chat";
import {extractErrorMessage} from "../../utils/errorHandler";

export const useChat = () => {
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
		return realId || id;
	}, []);

	/**
	 * Carga la lista de chats del usuario
	 */
	const fetchChats = useCallback(async () => {
		// Evitar múltiples peticiones simultáneas
		if (isLoadingRef.current) return [];

		try {
			isLoadingRef.current = true;
			setLoading(true);
			setError(null);

			const response = await chatService.getChats();

			if (response.status === "success" && Array.isArray(response.data)) {
				console.log("Chats obtenidos correctamente:", response.data.length);

				const processedChats = response.data.map((chat) => {
					// Asegurar que el chat tiene un ID
					if (!chat.id) {
						console.warn(
							"Chat recibido sin ID del servidor, esto no debería ocurrir"
						);
						return chat;
					}

					// Determinar si el usuario actual es el comprador o el vendedor
					const isSeller = user?.id === chat.sellerId;

					// Marcar los mensajes como propios o no
					if (chat.messages) {
						chat.messages = chat.messages.map((message) => ({
							...message,
							isMine: message.senderId === user?.id,
						}));
					}

					return chat;
				});

				// Actualizar el estado y la referencia local
				setChats(processedChats);
				localChatsRef.current = processedChats;
				return processedChats;
			} else {
				console.warn("Formato de respuesta inesperado:", response);
				setError("Error al cargar los chats. Formato de respuesta inesperado.");
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
	}, [user?.id]);

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

						if (response.status === "success") {
							// Procesar chat y mensajes - verificando que no sean vacíos
							const chat = response.data?.chat;
							const responseMessages = response.data?.messages || [];

							// Validar que el chat tenga al menos un ID
							if (chat && chat.id) {
								console.log(
									`Chat ${resolvedChatId} cargado correctamente con ${responseMessages.length} mensajes`
								);

								// Reiniciar contador de intentos al tener éxito
								chatFetchAttempts.current[resolvedChatId] = 0;

								// Asegurarse de que el chat tenga un ID válido
								if (!chat.id) {
									chat.id = resolvedChatId;
								}

								// Marcar los mensajes como propios o no
								const chatMessages = responseMessages.map((message) => ({
									...message,
									isMine: message.senderId === user?.id,
								}));

								// Actualizar estados
								setSelectedChat(chat);
								setMessages(chatMessages);

								// Añadir este chat a la lista si no existe
								setChats((prevChats) => {
									const exists = prevChats.some((c) => c.id === chat.id);
									if (!exists) {
										const updatedChats = [...prevChats, chat];
										localChatsRef.current = updatedChats;
										return updatedChats;
									}

									const updatedChats = prevChats.map((c) =>
										c.id === chat.id ? {...c, ...chat} : c
									);
									localChatsRef.current = updatedChats;
									return updatedChats;
								});

								return chat;
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
		[user?.id, resolveRealId]
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

				if (response.status === "success") {
					console.log("Chat creado correctamente:", response.data);
					const realChatId = response.data.chat_id;

					// Mapear ID temporal al ID real
					temporaryToRealIdMap.current.set(tempChatId, realChatId);

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
		[user, generateTemporaryId]
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

				const response = await chatService.sendMessage(resolvedChatId, {
					content: content.trim(),
				});

				if (response.status === "success") {
					console.log(
						"Mensaje para nuevo chat enviado correctamente:",
						response.data
					);

					// Reemplazar el mensaje temporal con el real
					if (response.data && response.data.id) {
						setMessages((prev) =>
							prev.map((msg) =>
								msg.id === tempMessage.id
									? {...response.data, isMine: true}
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
				console.error("Error al enviar mensaje a nuevo chat:", err);
				setError(extractErrorMessage(err, "Error al enviar el mensaje"));
				return false;
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
				console.log(`Enviando mensaje a chat ${resolvedChatId}...`);
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

				const response = await chatService.sendMessage(resolvedChatId, {
					content: content.trim(),
				});

				if (response.status === "success") {
					console.log("Mensaje enviado correctamente:", response.data);

					// Reemplazar el mensaje temporal con el real
					if (response.data && response.data.id) {
						setMessages((prev) =>
							prev.map((msg) =>
								msg.id === tempMessage.id
									? {...response.data, isMine: true}
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
									lastMessage: response.data,
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
				console.error("Error al enviar mensaje:", err);

				// Eliminar mensaje temporal en caso de error
				setMessages((prev) =>
					prev.filter((msg) => msg.id !== generateTemporaryId())
				);

				setError(extractErrorMessage(err, "Error al enviar el mensaje"));
				return false;
			} finally {
				isLoadingRef.current = false;
				setLoading(false);
			}
		},
		[selectedChat, user?.id, resolveRealId, generateTemporaryId]
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
			}

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
		(chat: Chat) => {
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
	};
};

export default useChat;
