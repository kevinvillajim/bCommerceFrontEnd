import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {Chat, Message} from "../domain/entities/Chat";

/**
 * Interfaces para respuestas de API
 */
export interface ChatListResponse {
	status: string;
	data: Chat[];
}

export interface ChatDetailResponse {
	status: string;
	data: {
		chat: Chat;
		messages: Message[];
	};
}

export interface MessageResponse {
	status: string;
	message: string;
	data: Message;
}

export interface CreateChatResponse {
	status: string;
	message: string;
	data: {
		chat_id: number;
	};
}

export interface UpdateChatStatusResponse {
	status: string;
	message: string;
	data: {
		chat_id: number;
		status: string;
	};
}

/**
 * Interfaces para solicitudes
 */
export interface SendMessageRequest {
	content: string;
}

export interface CreateChatRequest {
	seller_id: number;
	product_id: number;
	initial_message?: string;
}

export interface UpdateChatStatusRequest {
	status: "active" | "closed" | "archived";
}

/**
 * Servicio para gestionar chats y mensajes
 */
class ChatService {
	/**
	 * Obtiene la lista de chats del usuario actual
	 */
	async getChats(): Promise<ChatListResponse> {
		try {
			console.log("ChatService: Obteniendo lista de chats");
			const response = await ApiClient.get<any>(API_ENDPOINTS.CHAT.LIST);

			// Validación mejorada de la respuesta
			if (response) {
				// Caso 1: response.data es un array - formato directo
				if (Array.isArray(response.data)) {
					console.log(
						`ChatService: Se encontraron ${response.data.length} chats`
					);
					return {
						status: "success",
						data: response.data,
					};
				}
				// Caso 2: response.data.data es un array - formato anidado
				else if (response.data?.data && Array.isArray(response.data.data)) {
					console.log(
						`ChatService: Se encontraron ${response.data.data.length} chats (formato anidado)`
					);
					return {
						status: "success",
						data: response.data.data,
					};
				}
				// Caso 3: La respuesta es un objeto con status y data como objeto
				else if (response.status === "success" && response.data) {
					// Si data es un objeto pero no un array, podría ser un único chat
					const chatList = Array.isArray(response.data)
						? response.data
						: response.data.chats
							? response.data.chats
							: [];

					console.log(
						`ChatService: Se procesaron ${chatList.length} chats (formato especial)`
					);

					return {
						status: "success",
						data: chatList,
					};
				}
			}

			// Si llegamos aquí, la respuesta es válida pero sin chats
			console.log(
				"ChatService: No se encontraron chats o formato no reconocido"
			);
			return {
				status: "success",
				data: [],
			};
		} catch (error) {
			console.error("ChatService: Error al obtener chats:", error);
			// En caso de error, devolver una respuesta vacía pero válida
			return {
				status: "error",
				data: [],
			};
		}
	}

	/**
	 * Obtiene los detalles de un chat específico con sus mensajes
	 */
	async getChatDetails(chatId: number): Promise<ChatDetailResponse> {
		try {
			console.log(`ChatService: Obteniendo detalles del chat ${chatId}`);
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.CHAT.DETAILS(chatId)
			);

			// Validación mejorada
			if (response) {
				// Asegurar que response.data existe
				const responseData = response.data || {};

				// Extraer chat y mensajes con manejo de diferentes estructuras
				let chat: Chat | null = null;
				let messages: Message[] = [];

				// Caso 1: Respuesta directa con chat y messages
				if (responseData.chat) {
					chat = responseData.chat;
					messages = responseData.messages || [];
				}
				// Caso 2: Respuesta con data anidada
				else if (responseData.data && responseData.data.chat) {
					chat = responseData.data.chat;
					messages = responseData.data.messages || [];
				}
				// Caso 3: La respuesta completa es el chat (sin estructura anidada)
				else if (responseData.id) {
					chat = responseData;
					// En este caso, los mensajes podrían estar en .messages o ser un array separado
					messages = responseData.messages || [];
				}

				// Si el chat es un objeto vacío ({}), asignar null para mejor manejo
				if (chat && Object.keys(chat).length === 0) {
					chat = null;
				}

				// Si no hemos podido extraer un chat, creamos uno básico con el ID proporcionado
				if (!chat) {
					console.warn(
						`ChatService: No se encontró un formato de chat válido para ${chatId}, creando objeto básico`
					);
					chat = {
						id: chatId,
						userId: 0,
						sellerId: 0,
						productId: 0,
						status: "active",
						messages: [],
					};
				} else {
					// Asegurar que el chat tiene ID
					if (!chat.id) chat.id = chatId;
				}

				return {
					status: "success",
					data: {
						chat,
						messages,
					},
				};
			}

			throw new Error(`No se pudo obtener información del chat ${chatId}`);
		} catch (error) {
			console.error(
				`ChatService: Error al obtener detalles del chat ${chatId}:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Envía un mensaje a un chat
	 */
	async sendMessage(
		chatId: number,
		message: SendMessageRequest
	): Promise<MessageResponse> {
		try {
			console.log(`ChatService: Enviando mensaje al chat ${chatId}`);
			const response = await ApiClient.post<MessageResponse>(
				API_ENDPOINTS.CHAT.SEND_MESSAGE(chatId),
				message
			);

			if (!response) {
				throw new Error("No se recibió respuesta al enviar mensaje");
			}

			// Si la respuesta no tiene la estructura esperada, adaptarla
			if (!response.data && response.status) {
				return {
					status: response.status,
					message: response.message || "Mensaje enviado",
					data: {
						id: Math.floor(Math.random() * 10000), // ID temporal si no viene en la respuesta
						chatId: chatId,
						senderId: 0, // Se sobreescribirá en el hook
						content: message.content,
						isRead: false,
						createdAt: new Date().toISOString(),
					},
				};
			}

			return response;
		} catch (error) {
			console.error(
				`ChatService: Error al enviar mensaje al chat ${chatId}:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Crea un nuevo chat con un vendedor para un producto
	 * Opcionalmente puede incluir un mensaje inicial
	 */
	async createChat(data: CreateChatRequest): Promise<CreateChatResponse> {
		try {
			console.log(
				`ChatService: Creando chat con vendedor ${data.seller_id} para producto ${data.product_id}`
			);
			const response = await ApiClient.post<any>(
				API_ENDPOINTS.CHAT.CREATE,
				data
			);

			// Validación y adaptación de respuesta
			if (response) {
				// Intentar extraer chatId de diferentes formatos de respuesta posibles
				let chatId: number | null = null;

				// Opción 1: chat_id en data
				if (response.data?.chat_id) {
					chatId = response.data.chat_id;
				}
				// Opción 2: id en data
				else if (response.data?.id) {
					chatId = response.data.id;
				}
				// Opción 3: chat anidado con id
				else if (response.data?.chat?.id) {
					chatId = response.data.chat.id;
				}
				// Opción 4: chat anidado en data.data
				else if (response.data?.data?.chat?.id) {
					chatId = response.data.data.chat.id;
				}
				// Opción 5: chatId directo en data
				else if (response.data?.chatId) {
					chatId = response.data.chatId;
				}

				if (chatId) {
					return {
						status: "success",
						message: "Chat creado correctamente",
						data: {
							chat_id: chatId,
						},
					};
				}
			}

			throw new Error("Formato de respuesta inesperado al crear chat");
		} catch (error) {
			console.error("ChatService: Error al crear chat:", error);
			throw error;
		}
	}

	/**
	 * Actualiza el estado de un chat (cerrar, archivar, reabrir)
	 */
	async updateChatStatus(
		chatId: number,
		data: UpdateChatStatusRequest
	): Promise<UpdateChatStatusResponse> {
		try {
			console.log(
				`ChatService: Actualizando estado del chat ${chatId} a ${data.status}`
			);
			const response = await ApiClient.put<UpdateChatStatusResponse>(
				API_ENDPOINTS.CHAT.UPDATE_STATUS(chatId),
				data
			);

			// Validación y adaptación similar a las anteriores
			if (!response) {
				throw new Error("No se recibió respuesta al actualizar estado");
			}

			return response;
		} catch (error) {
			console.error(
				`ChatService: Error al actualizar estado del chat ${chatId}:`,
				error
			);
			throw error;
		}
	}
}

export default ChatService;