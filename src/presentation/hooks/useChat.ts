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
		if (isLoadingRef.current) return [];

		try {
			isLoadingRef.current = true;
			setLoading(true);
			setError(null);

			const response = await chatService.getChats();

			if (response.status === "success" && Array.isArray(response.data)) {
				console.log("Chats obtenidos correctamente:", response.data.length);

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
			// Verificar si el chat existe y si ya se ha intentado cargar demasiadas veces
			const attempts = chatFetchAttempts.current[chatId] || 0;
			if (attempts > 2) {
				console.warn(
					`Demasiados intentos para cargar el chat ${chatId}, abortando`
				);
				setError(`No se pudo cargar el chat. Intente más tarde.`);
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

				const response = await chatService.getChatDetails(chatId);

				if (response.status === "success") {
					// Procesar chat y mensajes - verificando que no sean vacíos
					const chat = response.data?.chat;
					const responseMessages = response.data?.messages || [];

					// Validar que el chat tenga al menos un ID
					if (chat && chat.id) {
						console.log(
							`Chat ${chatId} cargado correctamente con ${responseMessages.length} mensajes`
						);

						// Reiniciar contador de intentos al tener éxito
						chatFetchAttempts.current[chatId] = 0;

						// Asegurarse de que el chat tenga un ID válido
						if (!chat.id) {
							chat.id = chatId;
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
								return [...prevChats, chat];
							}
							return prevChats;
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
				console.log(`Enviando mensaje a chat ${selectedChat.id}...`);
				isLoadingRef.current = true;
				setLoading(true);
				setError(null);

				const response = await chatService.sendMessage(selectedChat.id, {
					content: content.trim(),
				});

				if (response.status === "success") {
					console.log("Mensaje enviado correctamente:", response.data);

					// Añadir el mensaje a la lista de mensajes
					const newMessage: Message = {
						...response.data,
						isMine: true, // El mensaje que acabamos de enviar es nuestro
						chatId: selectedChat.id,
						senderId: user?.id || 0,
						isRead: false,
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
					console.error("Error en respuesta al enviar mensaje:", response);
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
		[selectedChat, user?.id]
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

				const response = await chatService.createChat({
					seller_id: sellerId,
					product_id: productId,
				});

				if (response.status === "success") {
					console.log("Chat creado correctamente:", response.data);

					// Actualizar la lista de chats
					await fetchChats();
					return response.data.chat_id;
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
		[fetchChats]
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

				const response = await chatService.updateChatStatus(chatId, {status});

				if (response.status === "success") {
					console.log("Estado actualizado correctamente:", response.data);

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
					console.error("Error en respuesta al actualizar estado:", response);
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
			// Asegurarse de que no quedan referencias de carga activas
			isLoadingRef.current = false;
			// Limpiar estados al desmontar
			setChats([]);
			setSelectedChat(null);
			setMessages([]);
		};
	}, [user?.id, fetchChats]);

	// Exponer un método para actualizar selectedChat directamente
	const selectChat = useCallback(
		(chat: Chat) => {
			console.log("Seleccionando chat:", chat);
			setSelectedChat(chat);

			if (chat && chat.id) {
				fetchChatMessages(chat.id);
			}
		},
		[fetchChatMessages]
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
		createChat,
		updateChatStatus,
		setSelectedChat: selectChat,
	};
};

export default useChat;
