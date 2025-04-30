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

	// Referencias para control de estado
	const isLoadingRef = useRef(false);
	const chatService = useRef(new ChatService());
	const lastChatId = useRef<number | null>(null);

	// Obtener el usuario actual del hook de autenticación
	const {user} = useAuth();

	/**
	 * Carga la lista de chats del usuario
	 */
	const fetchChats = useCallback(async () => {
		if (isLoadingRef.current) return [];

		isLoadingRef.current = true;
		setLoading(true);
		setError(null);

		try {
			const response = await chatService.current.getChats();

			if (response.status === "success" && Array.isArray(response.data)) {
				const processedChats = response.data.map((chat) => {
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
				return processedChats;
			} else {
				console.warn("Formato de respuesta inesperado:", response);
				setError("Error al cargar los chats");
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
			if (isLoadingRef.current && lastChatId.current === chatId) {
				console.log(`Ya se está cargando el chat ${chatId}, esperando...`);
				return null;
			}

			isLoadingRef.current = true;
			lastChatId.current = chatId;
			setLoading(true);
			setError(null);

			try {
				const response = await chatService.current.getChatDetails(chatId);

				if (response.status === "success") {
					const chat = response.data?.chat;
					const responseMessages = response.data?.messages || [];

					if (chat && Object.keys(chat).length > 0) {
						// Procesar mensajes
						const chatMessages = responseMessages.map((message) => ({
							...message,
							isMine: message.senderId === user?.id,
						}));

						// Verificar si el chat ya existe en la lista
						const chatExists = chats.some((c) => c.id === chatId);
						if (!chatExists) {
							setChats((prev) => [...prev, chat]);
						}

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
				setLoading(false);
				isLoadingRef.current = false;
			}
		},
		[chats, user?.id]
	);

	/**
	 * Envía un mensaje al chat seleccionado
	 */
	const sendMessage = useCallback(
		async (content: string): Promise<boolean> => {
			if (!selectedChat?.id && !lastChatId.current) {
				console.error("No hay chat seleccionado para enviar mensaje");
				setError("No hay chat seleccionado");
				return false;
			}

			const chatId = selectedChat?.id || lastChatId.current;

			if (!chatId || !content.trim()) {
				setError("Mensaje vacío o chat inválido");
				return false;
			}

			if (isLoadingRef.current) {
				console.log("Enviando mensaje, espere...");
				return false;
			}

			isLoadingRef.current = true;
			setLoading(true);
			setError(null);

			try {
				const response = await chatService.current.sendMessage(chatId, {
					content: content.trim(),
				});

				if (response.status === "success") {
					// Añadir el mensaje a la lista
					const newMessage: Message = {
						...response.data,
						isMine: true,
					};

					// Actualizar mensajes solo si es el chat actual
					if (selectedChat?.id === chatId) {
						setMessages((prev) => [...prev, newMessage]);
					}

					// Actualizar el último mensaje en la lista de chats
					setChats((prev) =>
						prev.map((chat) => {
							if (chat.id === chatId) {
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
				setLoading(false);
				isLoadingRef.current = false;
			}
		},
		[selectedChat]
	);

	/**
	 * Crea un nuevo chat con un vendedor para un producto
	 */
	const createChat = useCallback(
		async (sellerId: number, productId: number): Promise<number | null> => {
			if (isLoadingRef.current) {
				console.log("Creando chat, espere...");
				return null;
			}

			isLoadingRef.current = true;
			setLoading(true);
			setError(null);

			try {
				// Primero verificar si ya existe un chat para este vendedor y producto
				const existingChats = await fetchChats();
				const existingChat = existingChats.find(
					(chat) => chat.sellerId === sellerId && chat.productId === productId
				);

				// Si ya existe un chat, usar ese
				if (existingChat?.id) {
					console.log(`Ya existe un chat con ID ${existingChat.id}`);
					lastChatId.current = existingChat.id;
					return existingChat.id;
				}

				// Si no existe, crear uno nuevo
				const response = await chatService.current.createChat({
					seller_id: sellerId,
					product_id: productId,
				});

				if (response.status === "success") {
					const chatId = response.data.chat_id;
					console.log(`Chat creado correctamente con ID ${chatId}`);

					// Guardar el ID del chat creado
					lastChatId.current = chatId;

					// Actualizar la lista de chats
					await fetchChats();

					return chatId;
				} else {
					setError(response.message || "Error al crear el chat");
					return null;
				}
			} catch (err) {
				console.error("Error al crear chat:", err);
				setError(extractErrorMessage(err, "Error al crear el chat"));
				return null;
			} finally {
				setLoading(false);
				isLoadingRef.current = false;
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
				const response = await chatService.current.updateChatStatus(chatId, {
					status,
				});

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
				setLoading(false);
				isLoadingRef.current = false;
			}
		},
		[selectedChat]
	);

	// Cargar chats al montar el componente
	useEffect(() => {
		if (user?.id) {
			fetchChats();
		}

		return () => {
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
