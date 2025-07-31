// src/presentation/hooks/useChat.ts - ERRORES DE TYPESCRIPT CORREGIDOS
import {useState, useEffect, useCallback, useRef} from "react";
import {useAuth} from "./useAuth";
import ChatService from "../../core/services/ChatService";
import type {Chat, Message} from "../../core/domain/entities/Chat";
import {extractErrorMessage} from "../../utils/errorHandler";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import ApiClient from "../../infrastructure/api/apiClient";

// Interfaces corregidas para las respuestas del API
interface SellerResponse {
	data?: {
		id?: number;
		seller_id?: number;
	};
}

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

	// Referencia fija para el rol
	const isSellerRef = useRef<boolean>(isSeller);
	const chatServiceRef = useRef<ChatService | null>(null);

	// Obtener el usuario actual del hook de autenticación
	const {user} = useAuth();

	// Crear una sola instancia del servicio de chat
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
	 * Obtiene información del vendedor por ID de usuario - CORREGIDO
	 */
	const getSellerIdFromUser = async (userId: number): Promise<number | null> => {
		try {
			const response = await ApiClient.get<SellerResponse>(API_ENDPOINTS.SELLERS.BY_USER_ID(userId));

			if (response?.data?.id) {
				return response.data.id;
			} else if (response?.data?.seller_id) {
				return response.data.seller_id;
			}

			return null;
		} catch (error) {
			console.error(`Error al obtener información del vendedor para usuario ${userId}:`, error);
			return null;
		}
	};

	/**
	 * Carga la lista de chats del usuario
	 */
	const fetchChats = useCallback(async () => {
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

			// Si es vendedor y tenemos el ID del usuario, intentar obtener el ID del vendedor
			if (isSellerRef.current && user?.id) {
				const sellerId = await getSellerIdFromUser(user.id);

				if (sellerId) {
					try {
						response = await chatService.getChatsBySellerIdExplicit(sellerId);
					} catch (explicitError) {
						console.warn("Error en búsqueda explícita por ID de vendedor:", explicitError);
						try {
							response = await chatService.getChatsBySellerIdExplicit(user.id);
						} catch (userIdError) {
							console.warn("Error en búsqueda explícita por ID de usuario:", userIdError);
							response = await chatService.getChats();
						}
					}
				} else {
					try {
						response = await chatService.getChatsBySellerIdExplicit(user.id);
					} catch (error) {
						console.warn("Error en búsqueda explícita por ID de usuario:", error);
						response = await chatService.getChats();
					}
				}
			} else {
				response = await chatService.getChats();
			}

			// Validar respuesta
			if (!response || response.status !== "success") {
				throw new Error("No se pudo obtener la lista de chats");
			}

			const chatList = response.data || [];
			setChats(chatList);
			localChatsRef.current = chatList;

			console.log(
				`✅ Cargados ${chatList.length} chats ${isSellerRef.current ? "como vendedor" : "como usuario"}`
			);

			return chatList;
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
			const attempts = chatFetchAttempts.current[chatId] || 0;
			if (attempts > 2) {
				console.warn(`Demasiados intentos para cargar el chat ${chatId}`);
				setError(`No se pudo cargar el chat. Intente más tarde.`);
				
				if (refreshIntervalRef.current) {
					clearInterval(refreshIntervalRef.current);
					refreshIntervalRef.current = null;
				}
				return null;
			}

			try {
				if (isLoadingRef.current) {
					console.log(`Petición bloqueada para chat ${chatId}`);
					return null;
				}

				console.log(`Cargando mensajes para chat ${chatId}...`);
				isLoadingRef.current = true;
				setLoading(true);
				setError(null);

				chatFetchAttempts.current[chatId] = attempts + 1;

				const chatService = getChatService();
				const response = await chatService.getChatDetails(chatId);

				if (response && response.status === "success" && response.data?.chat) {
					const chat = response.data.chat;
					const responseMessages = response.data.messages || [];

					if (chat.id) {
						console.log(`Chat ${chatId} cargado con ${responseMessages.length} mensajes`);

						// Reiniciar contador de intentos
						chatFetchAttempts.current[chatId] = 0;

						setSelectedChat(chat);
						setMessages(responseMessages);

						// Actualizar lista de chats
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
					}
				}

				console.error(`Error en respuesta para chat ${chatId}`);
				setError("Error al cargar los mensajes");
				return null;
			} catch (err) {
				console.error(`Error al obtener mensajes del chat ${chatId}:`, err);
				setError(extractErrorMessage(err, "Error al cargar los mensajes"));
				return null;
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
				console.log(`Creando chat con vendedor ${sellerId} para producto ${productId}...`);
				isLoadingRef.current = true;
				setLoading(true);
				setError(null);

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

				const chatService = getChatService();
				const response = await chatService.sendMessage(chatId, {
					content: content.trim(),
				});

				if (response.status === "success") {
					console.log("Mensaje para nuevo chat enviado correctamente");
					await fetchChatMessages(chatId);
					return true;
				} else {
					console.error("Error en respuesta al enviar mensaje:", response);
					setError(response.message || "Error al enviar el mensaje");
					return false;
				}
			} catch (err: any) {
				console.error("Error al enviar mensaje a nuevo chat:", err);

				// Manejar errores específicos del filtro de chat
				if (err?.response?.data?.status === 'error') {
					// Re-lanzar el error para que lo maneje el componente
					throw err;
				}
				
				setError(extractErrorMessage(err, "Error al enviar el mensaje"));
				return false;
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
				console.error("No se puede enviar mensaje: Chat no seleccionado o contenido vacío");
				return false;
			}

			if (isLoadingRef.current) {
				console.log("Envío bloqueado, hay una operación en curso");
				return false;
			}

			try {
				console.log(`Enviando mensaje a chat ${selectedChat.id} ${isSellerRef.current ? "como vendedor" : "como usuario"}...`);
				isLoadingRef.current = true;
				setLoading(true);
				setError(null);

				const chatService = getChatService();
				const response = await chatService.sendMessage(selectedChat.id, {
					content: content.trim(),
				});

				if (response.status === "success") {
					console.log("Mensaje enviado correctamente");
					// Recargar los mensajes para ver el nuevo mensaje
					await fetchChatMessages(selectedChat.id);
					return true;
				} else {
					console.error("Error en respuesta al enviar mensaje:", response);
					setError(response.message || "Error al enviar el mensaje");
					return false;
				}
			} catch (err: any) {
				console.error("Error al enviar mensaje:", err);
				
				// Manejar errores específicos del filtro de chat
				if (err?.response?.data?.status === 'error') {
					// Re-lanzar el error para que ChatInterface lo maneje
					throw err;
				}
				
				setError(extractErrorMessage(err, "Error al enviar el mensaje"));
				return false;
			} finally {
				isLoadingRef.current = false;
				setLoading(false);
			}
		},
		[selectedChat, fetchChatMessages, getChatService]
	);

	/**
	 * Actualiza el estado de un chat
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

				// Actualizar optimisticamente
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

				const chatService = getChatService();
				const response = await chatService.updateChatStatus(chatId, { status });

				if (response.status === "success") {
					console.log("Estado actualizado correctamente");
					return true;
				} else {
					console.error("Error en respuesta al actualizar estado:", response);
					await fetchChats(); // Revertir cambios
					setError(response.message || `Error al ${status} el chat`);
					return false;
				}
			} catch (err) {
				console.error(`Error al actualizar estado del chat ${chatId}:`, err);
				await fetchChats(); // Revertir cambios
				setError(extractErrorMessage(err, `Error al ${status} el chat`));
				return false;
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
		(chatId: number, intervalMs = 30000) => {
			if (refreshIntervalRef.current) {
				clearInterval(refreshIntervalRef.current);
				refreshIntervalRef.current = null;
			}

			chatFetchAttempts.current[chatId] = 0;
			console.log(`Iniciando polling para chat ${chatId}...`);

			refreshIntervalRef.current = setInterval(() => {
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

	// Cargar chats al montar el componente - OPTIMIZADO
	useEffect(() => {
	const controller = new AbortController();
		let mounted = true;

	if (user?.id && mounted) {
	console.log(`Valor de isSellerRef.current fijado en: ${isSellerRef.current}`);
	getChatService();
	 fetchChats();
		}

	return () => {
	mounted = false;
	controller.abort();
	isLoadingRef.current = false;
	stopMessagesPolling();
	setChats([]);
	 setSelectedChat(null);
	  setMessages([]);
		};
	}, [user?.id]);

	/**
	 * Selecciona un chat evitando cambios innecesarios
	 */
	const selectChat = useCallback(
		(chat: Chat | null) => {
			if (!chat) {
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
				console.log(`Chat ${chat.id} ya está seleccionado`);
				return;
			}

			console.log("Seleccionando chat:", chat);
			setSelectedChat(chat);

			if (chat && chat.id) {
				fetchChatMessages(chat.id);
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
				console.error("No se puede marcar mensajes como leídos: ID de chat no válido");
				return false;
			}

			try {
				console.log(`Marcando todos los mensajes del chat ${chatId} como leídos...`);
				setError(null);

				// Actualizar optimisticamente
				setMessages((prev) =>
					prev.map((msg) => ({
						...msg,
						isRead: msg.senderId !== user?.id ? true : msg.isRead,
					}))
				);

				setChats((prev) =>
					prev.map((chat) => {
						if (chat.id === chatId) {
							return { ...chat, unreadCount: 0 };
						}
						return chat;
					})
				);

				const chatService = getChatService();
				const response = await chatService.markAllMessagesAsRead(chatId);

				return response.status === "success";
			} catch (err) {
				console.error(`Error al marcar mensajes como leídos en chat ${chatId}:`, err);
				setError(extractErrorMessage(err, "Error al marcar mensajes como leídos"));
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
				console.log(`Marcando mensaje ${messageId} del chat ${chatId} como leído...`);
				setError(null);

				// Actualizar optimistamente
				setMessages((prev) =>
					prev.map((msg) => {
						if (msg.id === messageId) {
							return { ...msg, isRead: true };
						}
						return msg;
					})
				);

				const chatService = getChatService();
				const response = await chatService.markMessageAsRead(chatId, messageId);

				if (response.status === "success") {
					// Recalcular el conteo de no leídos
					const unreadCount = messages.filter(
						(msg) => !msg.isRead && msg.senderId !== user?.id
					).length;

					setChats((prev) =>
						prev.map((chat) => {
							if (chat.id === chatId) {
								return { ...chat, unreadCount };
							}
							return chat;
						})
					);
				}

				return response.status === "success";
			} catch (err) {
				console.error(`Error al marcar mensaje ${messageId} como leído:`, err);
				setError(extractErrorMessage(err, "Error al marcar mensaje como leído"));
				return false;
			}
		},
		[user?.id, messages, getChatService]
	);

	/**
	 * Carga más mensajes con paginación
	 */
	const loadMoreMessages = useCallback(
		async (chatId: number, page: number, limit: number = 20): Promise<boolean> => {
			if (!chatId || isLoadingRef.current) {
				return false;
			}

			try {
				console.log(`Cargando más mensajes para el chat ${chatId} (página ${page})...`);
				isLoadingRef.current = true;
				setLoading(true);
				setError(null);

				const chatService = getChatService();
				const response = await chatService.getMessages(chatId, page, limit);

				if (response.status === "success" && response.data.messages) {
					const newMessages = response.data.messages;

					setMessages((prev) => {
						const messageMap = new Map();
						prev.forEach((msg) => messageMap.set(msg.id, msg));
						newMessages.forEach((msg) => {
							if (!messageMap.has(msg.id)) {
								messageMap.set(msg.id, msg);
							}
						});

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
				console.error(`Error al cargar más mensajes para el chat ${chatId}:`, err);
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

				// Actualizar optimisticamente
				setChats((prev) => prev.filter((chat) => chat.id !== chatId));

				if (selectedChat && selectedChat.id === chatId) {
					setSelectedChat(null);
					setMessages([]);
					stopMessagesPolling();
				}

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
		[selectedChat, setSelectedChat, stopMessagesPolling, fetchChats, getChatService]
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