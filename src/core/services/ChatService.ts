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
			const response = await ApiClient.get<ChatListResponse>(
				API_ENDPOINTS.CHAT.LIST
			);

			// Validar la estructura de la respuesta
			if (response && Array.isArray(response.data)) {
				// Ya es un array, devolverlo directamente
				return {
					status: "success",
					data: response.data,
				};
			} else if (
				response &&
				response.data &&
				Array.isArray(response.data.data)
			) {
				// Formato anidado data.data
				return {
					status: "success",
					data: response.data.data,
				};
			} else if (response && response.status === "success" && !response.data) {
				// Respuesta vacía
				return {
					status: "success",
					data: [],
				};
			}

			// Si llegamos aquí, la respuesta no tiene el formato esperado
			console.warn("Formato de respuesta inesperado en getChats:", response);
			return {
				status: "error",
				data: [],
			};
		} catch (error) {
			console.error("Error al obtener chats:", error);
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
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.CHAT.DETAILS(chatId)
			);

			// Validar y adaptar la respuesta
			if (response && response.status === "success") {
				// Asegurarse de que chat y messages existan, incluso vacíos
				const chatData = response.data?.chat || {};
				const messages = response.data?.messages || [];

				// Validar que el chat tenga al menos un ID para considerarlo válido
				if (!chatData.id) {
					chatData.id = chatId; // Asignar ID si no existe
				}

				return {
					status: "success",
					data: {
						chat: chatData,
						messages: messages,
					},
				};
			} else {
				throw new Error(
					`La respuesta no tiene el formato esperado: ${JSON.stringify(response)}`
				);
			}
		} catch (error) {
			console.error(`Error al obtener detalles del chat ${chatId}:`, error);
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
			const response = await ApiClient.post<MessageResponse>(
				API_ENDPOINTS.CHAT.SEND_MESSAGE(chatId),
				message
			);
			return response;
		} catch (error) {
			console.error(`Error al enviar mensaje al chat ${chatId}:`, error);
			throw error;
		}
	}

	/**
	 * Crea un nuevo chat con un vendedor para un producto
	 */
	async createChat(data: CreateChatRequest): Promise<CreateChatResponse> {
		try {
			const response = await ApiClient.post<CreateChatResponse>(
				API_ENDPOINTS.CHAT.CREATE,
				data
			);
			return response;
		} catch (error) {
			console.error("Error al crear chat:", error);
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
			const response = await ApiClient.put<UpdateChatStatusResponse>(
				API_ENDPOINTS.CHAT.UPDATE_STATUS(chatId),
				data
			);
			return response;
		} catch (error) {
			console.error(`Error al actualizar estado del chat ${chatId}:`, error);
			throw error;
		}
	}

	/**
	 * Archiva un chat (equivalente a eliminar)
	 */
	async archiveChat(
		chatId: number
	): Promise<{status: string; message: string}> {
		try {
			const response = await ApiClient.delete<{
				status: string;
				message: string;
			}>(API_ENDPOINTS.CHAT.DETAILS(chatId));
			return response;
		} catch (error) {
			console.error(`Error al archivar chat ${chatId}:`, error);
			throw error;
		}
	}
}

export default ChatService;
