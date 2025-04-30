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

	// Añadimos una referencia para controlar peticiones repetidas
	const isLoadingRef = useRef(false);
	const chatFetchAttempts = useRef<Record<number, number>>({});

	// Obtener el usuario actual del hook de autenticación
	const {user} = useAuth();
	const chatService = new ChatService();

	/**
	 * Carga la lista de chats del usuario
	 */
	const fetchChats = useCallback(async () => {
		// Evitar múltiples peticiones simultáneas
		if (isLoadingRef.current) return;

		isLoadingRef.current = true;
		setLoading(true);
		setError(null);

		try {
			const response = await chatService.getChats();

			if (response.status === "success" && Array.isArray(response.data)) {
				const processedChats = response.data.map((chat) => {
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

				setChats(processedChats);
			} else {
				console.warn("Formato de respuesta inesperado:", response);
				setError("Error al cargar los chats. Formato de respuesta inesperado.");
			}
		} catch (err) {
			console.error("Error al obtener chats:", err);
			setError(extractErrorMessage(err, "Error al cargar los chats"));
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
			// Verificar si el chat existe y si ya se ha intentado cargar demasiadas veces
			const attempts = chatFetchAttempts.current[chatId] || 0;
			if (attempts > 2) {
				console.warn(
					`Demasiados intentos para cargar el chat ${chatId}, abortando`
				);
				setError(`No se pudo cargar el chat. Intente más tarde.`);
				return null;
			}

			// Evitar múltiples peticiones simultáneas
			if (isLoadingRef.current) return null;

			isLoadingRef.current = true;
			setLoading(true);
			setError(null);

			try {
				// Incrementar contador de intentos
				chatFetchAttempts.current[chatId] = attempts + 1;

				const response = await chatService.getChatDetails(chatId);

				if (response.status === "success") {
					// Procesar chat y mensajes - verificando que no sean vacíos
					const chat = response.data?.chat;
					const responseMessages = response.data?.messages || [];

					// Validar que el chat no sea un objeto vacío
					if (chat && Object.keys(chat).length > 0) {
						// Reiniciar contador de intentos al tener éxito
						chatFetchAttempts.current[chatId] = 0;

						const chatMessages = responseMessages.map((message) => ({
							...message,
							isMine: message.senderId === user?.id,
						}));

						setSelectedChat(chat);
						setMessages(chatMessages);
						return chat;
					} else {
						setError("Chat no encontrado o sin acceso");
						return null;
					}
				} else {
					setError("Error al cargar los mensajes");
					return null;
				}
			} catch (err) {
				console.error(`Error al obtener mensajes del chat ${chatId}:`, err);
				setError(extractErrorMessage(err, "Error al cargar los mensajes"));
				return null;
			} finally {
				isLoadingRef.current = false;
				setLoading(false);
			}
		},
		[user?.id]
	);

	/**
	 * Envía un mensaje al chat seleccionado
	 */
	const sendMessage = useCallback(
		async (content: string): Promise<boolean> => {
			if (!selectedChat || !selectedChat.id || !content.trim()) return false;
			if (isLoadingRef.current) return false;

			isLoadingRef.current = true;
			setLoading(true);
			setError(null);

			try {
				const response = await chatService.sendMessage(selectedChat.id, {
					content: content.trim(),
				});

				if (response.status === "success") {
					// Añadir el mensaje a la lista de mensajes
					const newMessage: Message = {
						...response.data,
						isMine: true, // El mensaje que acabamos de enviar es nuestro
					};

					setMessages((prev) => [...prev, newMessage]);

					// Actualizar el último mensaje en la lista de chats
					setChats((prev) =>
						prev.map((chat) => {
							if (chat.id === selectedChat.id) {
								return {
									...chat,
									lastMessage: newMessage,
									updatedAt: new Date().toISOString(),
								};
							}
							return chat;
						})
					);

					return true;
				} else {
					setError(response.message || "Error al enviar el mensaje");
					return false;
				}
			} catch (err) {
				console.error("Error al enviar mensaje:", err);
				setError(extractErrorMessage(err, "Error al enviar el mensaje"));
				return false;
			} finally {
				isLoadingRef.current = false;
				setLoading(false);
			}
		},
		[selectedChat]
	);

	/**
	 * Crea un nuevo chat con un vendedor para un producto
	 */
	const createChat = useCallback(
		async (sellerId: number, productId: number) => {
			if (isLoadingRef.current) return null;

			isLoadingRef.current = true;
			setLoading(true);
			setError(null);

			try {
				const response = await chatService.createChat({
					seller_id: sellerId,
					product_id: productId,
				});

				if (response.status === "success") {
					// Actualizar la lista de chats
					await fetchChats();
					return response.data.chat_id;
				} else {
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
		[fetchChats]
	);

	/**
	 * Actualiza el estado de un chat (cerrar, archivar, reabrir)
	 */
	const updateChatStatus = useCallback(
		async (chatId: number, status: "active" | "closed" | "archived") => {
			if (isLoadingRef.current) return false;

			isLoadingRef.current = true;
			setLoading(true);
			setError(null);

			try {
				const response = await chatService.updateChatStatus(chatId, {status});

				if (response.status === "success") {
					// Actualizar el estado en la lista de chats
					setChats((prev) =>
						prev.map((chat) => {
							if (chat.id === chatId) {
								return {...chat, status};
							}
							return chat;
						})
					);

					// Si es el chat seleccionado, actualizar también
					if (selectedChat && selectedChat.id === chatId) {
						setSelectedChat((prev) => (prev ? {...prev, status} : null));
					}

					return true;
				} else {
					setError(
						response.message ||
							`Error al ${status === "active" ? "reabrir" : status === "closed" ? "cerrar" : "archivar"} el chat`
					);
					return false;
				}
			} catch (err) {
				console.error(`Error al actualizar estado del chat ${chatId}:`, err);
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
		[selectedChat]
	);

	// Cargar chats al montar el componente, solo una vez
	useEffect(() => {
		const controller = new AbortController();

		if (user?.id) {
			fetchChats();
		}

		return () => {
			controller.abort();
			// Limpiar estados al desmontar
			setChats([]);
			setSelectedChat(null);
			setMessages([]);
		};
	}, [user?.id, fetchChats]);

	return {
		chats,
		selectedChat,
		messages,
		loading,
		error,
		fetchChats,
		fetchChatMessages,
		sendMessage,
		createChat,
		updateChatStatus,
		setSelectedChat,
	};
};

export default useChat;
