// src/presentation/hooks/useChat.ts - VERSIÓN CORREGIDA
import {useState, useEffect, useCallback, useRef} from "react";
import {useAuth} from "./useAuth";
import ChatService from "../../core/services/ChatService";
import type {Chat, Message} from "../../core/domain/entities/Chat";
import {extractErrorMessage} from "../../utils/errorHandler";

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

	// CORRECCIÓN 1: Almacenar el valor de isSeller en una ref y NO actualizarlo nunca
	const isSellerRef = useRef<boolean>(isSeller);

	// CORRECCIÓN 2: Referencia para almacenar instancia única del servicio
	const chatServiceRef = useRef<ChatService | null>(null);

	// Obtener el usuario actual del hook de autenticación
	const {user} = useAuth();

	// CORRECCIÓN 3: Crear una sola instancia del servicio de chat
	const getChatService = useCallback(() => {
		if (!chatServiceRef.current) {
			console.log(
				`Creando instancia única de ChatService (isSeller=${isSellerRef.current})`
			);
			chatServiceRef.current = new ChatService(isSellerRef.current);
		}
		return chatServiceRef.current;
	}, []);

	/**
	 * Carga la lista de chats del usuario
	 */
	const fetchChats = useCallback(async () => {
		// Evitar múltiples peticiones simultáneas
		if (isLoadingRef.current) return [];

		try {
			console.log(
				`🔄 Obteniendo lista de chats ${isSellerRef.current ? "como vendedor" : "como usuario"}...`
			);
			isLoadingRef.current = true;
			setLoading(true);
			setError(null);

			const chatService = getChatService();
			let response;

			// Si es vendedor y tenemos el ID del usuario, intentar con la ruta específica por ID
			if (isSellerRef.current && user?.id) {
				console.log(
					`Intentando obtener chats para vendedor con ID: ${user.id}`
				);
				try {
					// Intentar primero con la ruta explícita por ID de vendedor
					response = await chatService.getChatsBySellerIdExplicit(user.id);
					console.log(`Respuesta de búsqueda explícita por ID: `, response);
				} catch (explicitError) {
					console.warn(
						`Error en búsqueda explícita, intentando ruta general: `,
						explicitError
					);
					// Si falla, intentar con la ruta general
					response = await chatService.getChats();
				}
			} else {
				// Para usuarios normales, usar la ruta estándar
				response = await chatService.getChats();
			}

			if (!response || !response.data) {
				console.warn("Respuesta vacía o inválida");
				setError(
					"Error al cargar los chats. La respuesta del servidor es inválida."
				);
				setChats([]);
				return [];
			}

			// Normalizar el formato de los chats
			const chatsData = Array.isArray(response.data) ? response.data : [];
			console.log(`✅ Se encontraron ${chatsData.length} chats`);

			setChats(chatsData);
			localChatsRef.current = chatsData;
			return chatsData;
		} catch (err) {
			console.error("Error al obtener chats:", err);
			setError(extractErrorMessage(err, "Error al cargar los chats"));
			return [];
		} finally {
			setLoading(false);
			isLoadingRef.current = false;
		}
	}, [getChatService, user?.id]);

	/**
	 * Carga los mensajes de un chat específico
	 */
	const fetchChatMessages = useCallback(
		async (chatId: number) => {
			// Verificar si el chat existe y si ya se ha intentado cargar demasiadas veces
			const attempts = chatFetchAttempts.current[chatId] || 0;
			if (attempts > 2) {
				console.warn(
					`Demasiados intentos para cargar el chat ${chatId}, abortando`
				);
				setError(`No se pudo cargar el chat. Intente más tarde.`);

				// Detener el polling si está activo para este chat
				if (refreshIntervalRef.current) {
					console.log(
						`Deteniendo polling para chat ${chatId} por demasiados intentos fallidos`
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
						`Petición bloqueada para chat ${chatId}, ya hay una en curso`
					);
					return null;
				}

				console.log(`Cargando mensajes para chat ${chatId}...`);
				isLoadingRef.current = true;
				setLoading(true);
				setError(null);

				// Incrementar contador de intentos
				chatFetchAttempts.current[chatId] = attempts + 1;

				try {
					const chatService = getChatService();
					const response = await chatService.getChatDetails(chatId);

					if (response && response.status === "success") {
						// Procesar chat y mensajes - verificando que no sean vacíos
						let chat = response.data?.chat;
						let responseMessages = response.data?.messages || [];

						// Validar que el chat tenga ID
						if (chat && chat.id) {
							console.log(
								`Chat ${chatId} cargado correctamente con ${responseMessages.length} mensajes`
							);

							// Reiniciar contador de intentos al tener éxito
							chatFetchAttempts.current[chatId] = 0;

							// Actualizar estados
							setSelectedChat(chat);
							setMessages(responseMessages);

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
							console.error(`Chat ${chatId} no tiene un formato válido:`, chat);
							setError("Chat no encontrado o sin acceso");
							return null;
						}
					} else {
						console.error(`Error en respuesta para chat ${chatId}:`, response);
						setError("Error al cargar los mensajes");
						return null;
					}
				} catch (err) {
					console.error(`Error al obtener mensajes del chat ${chatId}:`, err);
					setError(extractErrorMessage(err, "Error al cargar los mensajes"));
					return null;
				}
			} finally {
				isLoadingRef.current = false;
				setLoading(false);
			}
		},
		[getChatService]
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

				// Enviar la petición al servidor
				const chatService = getChatService();
				const response = await chatService.createChat({
					seller_id: sellerId,
					product_id: productId,
				});

				if (response.status === "success" && response.data?.chat_id) {
					console.log("Chat creado correctamente:", response.data);
					const chatId = response.data.chat_id;

					// Cargar el chat creado
					await fetchChatMessages(chatId);

					return chatId;
				} else {
					console.error("Error en respuesta al crear chat:", response);
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
		[fetchChatMessages, getChatService]
	);

	/**
	 * Envía un mensaje a un chat recién creado
	 */
	const sendMessageForNewChat = useCallback(
		async (chatId: number, content: string): Promise<boolean> => {
			if (!chatId || !content.trim()) {
				console.error("No se puede enviar mensaje: Chat ID o contenido vacío");
				return false;
			}

			if (isLoadingRef.current) {
				console.log("Envío bloqueado, hay una operación en curso");
				return false;
			}

			try {
				console.log(`Enviando mensaje al nuevo chat ${chatId}...`);
				isLoadingRef.current = true;
				setLoading(true);
				setError(null);

				try {
					const chatService = getChatService();
					const response = await chatService.sendMessage(chatId, {
						content: content.trim(),
					});

					if (response.status === "success") {
						console.log(
							"Mensaje para nuevo chat enviado correctamente:",
							response.data
						);

						// Refrescar chat para sincronizar
						await fetchChatMessages(chatId);
						return true;
					} else {
						console.error("Error en respuesta al enviar mensaje:", response);
						setError(response.message || "Error al enviar el mensaje");
						return false;
					}
				} catch (err) {
					console.error("Error al enviar mensaje a nuevo chat:", err);
					setError(extractErrorMessage(err, "Error al enviar el mensaje"));
					return false;
				}
			} finally {
				isLoadingRef.current = false;
				setLoading(false);
			}
		},
		[fetchChatMessages, getChatService]
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

			if (isLoadingRef.current) {
				console.log("Envío bloqueado, hay una operación en curso");
				return false;
			}

			try {
				console.log(
					`Enviando mensaje a chat ${selectedChat.id} ${isSellerRef.current ? "como vendedor" : "como usuario"}...`
				);
				isLoadingRef.current = true;
				setLoading(true);
				setError(null);

				try {
					const chatService = getChatService();
					const response = await chatService.sendMessage(selectedChat.id, {
						content: content.trim(),
					});

					if (response.status === "success") {
						console.log("Mensaje enviado correctamente:", response.data);

						// Recargar los mensajes
						await fetchChatMessages(selectedChat.id);
						return true;
					} else {
						console.error("Error en respuesta al enviar mensaje:", response);
						setError(response.message || "Error al enviar el mensaje");
						return false;
					}
				} catch (err) {
					console.error("Error al enviar mensaje:", err);
					setError(extractErrorMessage(err, "Error al enviar el mensaje"));
					return false;
				}
			} finally {
				isLoadingRef.current = false;
				setLoading(false);
			}
		},
		[selectedChat, fetchChatMessages, getChatService]
	);

	/**
	 * Actualiza el estado de un chat (cerrar, archivar, reabrir)
	 */
	const updateChatStatus = useCallback(
		async (chatId: number, status: "active" | "closed" | "archived") => {
			if (isLoadingRef.current) {
				console.log("Actualización bloqueada, hay una operación en curso");
				return false;
			}

			try {
				console.log(`Actualizando estado de chat ${chatId} a ${status}...`);
				isLoadingRef.current = true;
				setLoading(true);
				setError(null);

				// Actualizar optimistamente el estado en la UI mientras esperamos respuesta
				setChats((prev) =>
					prev.map((chat) => {
						if (chat.id === chatId) {
							return {...chat, status};
						}
						return chat;
					})
				);

				if (selectedChat && selectedChat.id === chatId) {
					setSelectedChat((prev) => (prev ? {...prev, status} : null));
				}

				try {
					const chatService = getChatService();
					const response = await chatService.updateChatStatus(chatId, {
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
					console.error(`Error al actualizar estado del chat ${chatId}:`, err);

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
		[selectedChat, fetchChats, getChatService]
	);

	/**
	 * Iniciar actualización periódica de mensajes
	 */
	const startMessagesPolling = useCallback(
		(chatId: number, intervalMs = 15000) => {
			// Limpiar cualquier intervalo existente
			if (refreshIntervalRef.current) {
				clearInterval(refreshIntervalRef.current);
				refreshIntervalRef.current = null;
			}

			// Reiniciar contador de intentos al iniciar nuevo polling
			chatFetchAttempts.current[chatId] = 0;

			console.log(`Iniciando polling para chat ${chatId}...`);

			// Crear un nuevo intervalo para el chat específico
			refreshIntervalRef.current = setInterval(() => {
				// Solo actualizar si no hay otra petición en curso
				if (!isLoadingRef.current && chatId) {
					console.log(`Actualizando mensajes del chat ${chatId} (polling)...`);
					fetchChatMessages(chatId);
				}
			}, intervalMs);

			return () => {
				if (refreshIntervalRef.current) {
					clearInterval(refreshIntervalRef.current);
					refreshIntervalRef.current = null;
				}
			};
		},
		[fetchChatMessages]
	);

	/**
	 * Detener el polling de mensajes
	 */
	const stopMessagesPolling = useCallback(() => {
		if (refreshIntervalRef.current) {
			clearInterval(refreshIntervalRef.current);
			refreshIntervalRef.current = null;
			console.log("Polling de mensajes detenido");
		}
	}, []);

	// CORRECCIÓN 4: Cargar chats al montar el componente, solo una vez
	useEffect(() => {
		const controller = new AbortController();

		if (user?.id) {
			// Asegurarse de que isSellerRef no cambie
			console.log(
				`Valor de isSellerRef.current fijado en: ${isSellerRef.current}`
			);

			// Crear instancia y cargar chats
			getChatService();
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
	}, [user?.id, fetchChats, stopMessagesPolling, getChatService]);

	// CORRECCIÓN 5: Optimizar la función selectChat para evitar cambios innecesarios
	const selectChat = useCallback(
		(chat: Chat | null) => {
			// CORRECCIÓN: Evitar actualizar estado si el chat es el mismo o ambos son null
			if (!chat) {
				// Solo actualizar si previamente había un chat seleccionado
				if (selectedChat !== null) {
					console.log("Seleccionando chat: null");
					setSelectedChat(null);
					setMessages([]);
					stopMessagesPolling();
				}
				return;
			}

			// Evitar actualizar si es el mismo chat
			if (selectedChat && selectedChat.id === chat.id) {
				console.log(
					`Chat ${chat.id} ya está seleccionado, omitiendo cambio de estado.`
				);
				return;
			}

			console.log("Seleccionando chat:", chat);
			setSelectedChat(chat);

			if (chat && chat.id) {
				fetchChatMessages(chat.id);
				// Iniciar polling de mensajes
				startMessagesPolling(chat.id);
			}
		},
		[fetchChatMessages, startMessagesPolling, stopMessagesPolling, selectedChat]
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

			try {
				console.log(
					`Marcando todos los mensajes del chat ${chatId} como leídos...`
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
						if (chat.id === chatId) {
							return {
								...chat,
								unreadCount: 0,
							};
						}
						return chat;
					})
				);

				// Enviar la solicitud al servidor
				const chatService = getChatService();
				const response = await chatService.markAllMessagesAsRead(chatId);

				return response.status === "success";
			} catch (err) {
				console.error(
					`Error al marcar mensajes como leídos en chat ${chatId}:`,
					err
				);
				setError(
					extractErrorMessage(err, "Error al marcar mensajes como leídos")
				);
				return false;
			}
		},
		[user?.id, getChatService]
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

			try {
				console.log(
					`Marcando mensaje ${messageId} del chat ${chatId} como leído...`
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
				const chatService = getChatService();
				const response = await chatService.markMessageAsRead(chatId, messageId);

				// Actualizar el conteo de no leídos en la lista de chats
				if (response.status === "success") {
					// Recalcular el conteo de no leídos
					const unreadCount = messages.filter(
						(msg) => !msg.isRead && msg.senderId !== user?.id
					).length;

					setChats((prev) =>
						prev.map((chat) => {
							if (chat.id === chatId) {
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
					`Error al marcar mensaje ${messageId} como leído en chat ${chatId}:`,
					err
				);
				setError(
					extractErrorMessage(err, "Error al marcar mensaje como leído")
				);
				return false;
			}
		},
		[user?.id, messages, getChatService]
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

			try {
				console.log(
					`Cargando más mensajes para el chat ${chatId} (página ${page})...`
				);
				isLoadingRef.current = true;
				setLoading(true);
				setError(null);

				// Obtener mensajes paginados
				const chatService = getChatService();
				const response = await chatService.getMessages(chatId, page, limit);

				if (response.status === "success" && response.data.messages) {
					const newMessages = response.data.messages;

					// Agregar mensajes manteniendo el orden y evitando duplicados
					setMessages((prev) => {
						// Crear un mapa de IDs para evitar duplicados
						const messageMap = new Map();
						prev.forEach((msg) => messageMap.set(msg.id, msg));
						newMessages.forEach((msg) => {
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
					`Error al cargar más mensajes para el chat ${chatId}:`,
					err
				);
				setError(extractErrorMessage(err, "Error al cargar más mensajes"));
				return false;
			} finally {
				isLoadingRef.current = false;
				setLoading(false);
			}
		},
		[getChatService]
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

			try {
				console.log(`Eliminando chat ${chatId}...`);
				setLoading(true);
				setError(null);

				// Actualizar localmente de forma optimista
				setChats((prev) => prev.filter((chat) => chat.id !== chatId));

				// Si el chat eliminado es el seleccionado, limpiar selección
				if (selectedChat && selectedChat.id === chatId) {
					setSelectedChat(null);
					setMessages([]);
					stopMessagesPolling();
				}

				// Enviar la solicitud al servidor
				const chatService = getChatService();
				const response = await chatService.deleteChat(chatId);

				return response.status === "success";
			} catch (err) {
				console.error(`Error al eliminar chat ${chatId}:`, err);
				setError(extractErrorMessage(err, "Error al eliminar chat"));

				// Revertir cambios si hay error
				await fetchChats();
				return false;
			} finally {
				setLoading(false);
			}
		},
		[
			selectedChat,
			setSelectedChat,
			stopMessagesPolling,
			fetchChats,
			getChatService,
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
