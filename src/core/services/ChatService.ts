// src/core/services/ChatService.ts - VERSIÓN CORREGIDA
import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {Chat, Message, ContentFilterResponse} from "../domain/entities/Chat";

/**
 * Interfaces para respuestas de API - CORREGIDAS
 */
export interface ChatListResponse {
	status: string;
	data: Chat[];
	meta?: {
		total: number;
		per_page: number;
		current_page: number;
		last_page: number;
	};
}

export interface ChatDetailResponse {
	status: string;
	data: {
		chat: Chat;
		messages: Message[];
		pagination?: {
			currentPage: number;
			limit: number;
			total: number;
		};
	};
}

export interface MessagesResponse {
	status: string;
	data: {
		messages: Message[];
		pagination: {
			currentPage: number;
			limit: number;
			total: number;
		};
	};
}

export interface MessageResponse {
	status: string;
	message: string;
	data: {
		message: Message;
	};
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

export interface MarkAsReadResponse {
	status: string;
	message: string;
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
 * Servicio para gestionar chats y mensajes - CORREGIDO
 */
class ChatService {
	private readonly isSeller: boolean;
	private readonly serviceId: string;

	constructor(isSeller = false) {
		this.isSeller = isSeller;
		this.serviceId = `chat-service-${Date.now()}-${Math.round(Math.random() * 1000)}`;
		console.log(
			`ChatService inicializado como ${isSeller ? "vendedor" : "usuario"} (ID: ${this.serviceId})`
		);
	}

	/**
	 * Obtiene el endpoint adecuado según el rol del usuario
	 */
	private getEndpoint(
		type:
			| "LIST"
			| "DETAILS"
			| "CREATE"
			| "SEND_MESSAGE"
			| "UPDATE_STATUS"
			| "GET_MESSAGES"
			| "MARK_ALL_READ"
			| "MARK_MESSAGE_READ"
			| "DELETE",
		...params: any[]
	): string {
		if (this.isSeller) {
			switch (type) {
				case "LIST":
					return API_ENDPOINTS.CHAT.SELLER.LIST;
				case "DETAILS":
					return API_ENDPOINTS.CHAT.SELLER.DETAILS(params[0]);
				case "SEND_MESSAGE":
					return API_ENDPOINTS.CHAT.SELLER.SEND_MESSAGE(params[0]);
				case "UPDATE_STATUS":
					return API_ENDPOINTS.CHAT.SELLER.UPDATE_STATUS(params[0]);
				case "GET_MESSAGES":
					return API_ENDPOINTS.CHAT.SELLER.GET_MESSAGES(params[0]);
				case "MARK_ALL_READ":
					return API_ENDPOINTS.CHAT.SELLER.MARK_ALL_READ(params[0]);
				case "MARK_MESSAGE_READ":
					return API_ENDPOINTS.CHAT.MARK_MESSAGE_READ(params[0], params[1]);
				case "DELETE":
					return API_ENDPOINTS.CHAT.DELETE(params[0]);
				case "CREATE":
					return API_ENDPOINTS.CHAT.CREATE;
				default:
					return "";
			}
		} else {
			switch (type) {
				case "LIST":
					return API_ENDPOINTS.CHAT.LIST;
				case "DETAILS":
					return API_ENDPOINTS.CHAT.DETAILS(params[0]);
				case "CREATE":
					return API_ENDPOINTS.CHAT.CREATE;
				case "SEND_MESSAGE":
					return API_ENDPOINTS.CHAT.SEND_MESSAGE(params[0]);
				case "UPDATE_STATUS":
					return API_ENDPOINTS.CHAT.UPDATE_STATUS(params[0]);
				case "DELETE":
					return API_ENDPOINTS.CHAT.DELETE(params[0]);
				case "GET_MESSAGES":
					return API_ENDPOINTS.CHAT.GET_MESSAGES(params[0]);
				case "MARK_ALL_READ":
					return API_ENDPOINTS.CHAT.MARK_ALL_READ(params[0]);
				case "MARK_MESSAGE_READ":
					return API_ENDPOINTS.CHAT.MARK_MESSAGE_READ(params[0], params[1]);
				default:
					return "";
			}
		}
	}

	/**
	 * Valida y normaliza respuesta del API
	 */
	private validateApiResponse<T>(response: any, expectedFields: string[] = []): T | null {
		if (!response || typeof response !== 'object') {
			console.warn('Respuesta inválida del API:', response);
			return null;
		}

		// Verificar campos requeridos si se especifican
		for (const field of expectedFields) {
			if (!(field in response)) {
				console.warn(`Campo requerido '${field}' no encontrado en respuesta:`, response);
				return null;
			}
		}

		return response as T;
	}

	/**
	 * Obtiene la lista de chats del usuario actual
	 */
	async getChats(): Promise<ChatListResponse> {
		try {
			console.log(
				`ChatService (${this.serviceId}): Obteniendo lista de chats ${this.isSeller ? "como vendedor" : "como usuario"}`
			);
			const endpoint = this.getEndpoint("LIST");
			
			const response = await ApiClient.get<any>(endpoint);
			const validatedResponse = this.validateApiResponse<any>(response);

			if (!validatedResponse) {
				return { status: "error", data: [] };
			}

			// Manejar diferentes formatos de respuesta
			if (validatedResponse.status === "success") {
				const data = Array.isArray(validatedResponse.data) 
					? validatedResponse.data 
					: validatedResponse.data?.data || [];
				
				console.log(`ChatService (${this.serviceId}): Se encontraron ${data.length} chats`);
				
				return {
					status: "success",
					data: data,
					meta: validatedResponse.data?.meta || validatedResponse.meta
				};
			} else if (Array.isArray(validatedResponse)) {
				console.log(`ChatService (${this.serviceId}): Array directo con ${validatedResponse.length} chats`);
				return {
					status: "success",
					data: validatedResponse
				};
			}

			console.log(`ChatService (${this.serviceId}): No se encontraron chats`);
			return { status: "success", data: [] };

		} catch (error) {
			console.error(`ChatService (${this.serviceId}): Error al obtener chats:`, error);
			return { status: "error", data: [] };
		}
	}

	/**
	 * Obtiene los detalles de un chat específico con sus mensajes
	 */
	async getChatDetails(
		chatId: number,
		page: number = 1,
		limit: number = 50
	): Promise<ChatDetailResponse> {
		try {
			console.log(
				`ChatService (${this.serviceId}): Obteniendo detalles del chat ${chatId}`
			);

			const endpoint = this.getEndpoint("DETAILS", chatId);
			const response = await ApiClient.get<any>(
				`${endpoint}?page=${page}&limit=${limit}`
			);

			const validatedResponse = this.validateApiResponse<any>(response, ['status']);

			if (!validatedResponse) {
				throw new Error(`No se pudo obtener información del chat ${chatId}`);
			}

			if (validatedResponse.status === "success") {
				// Extraer datos con valores por defecto
				const responseData = validatedResponse.data || {};
				const chat: Chat = responseData.chat || {
					id: chatId,
					userId: 0,
					sellerId: 0,
					productId: 0,
					status: "active" as const,
					messages: []
				};
				
				const messages: Message[] = responseData.messages || [];
				const pagination = responseData.pagination || {
					currentPage: page,
					limit: limit,
					total: messages.length
				};

				// Asegurar que el chat tiene ID
				if (!chat.id) {
					chat.id = chatId;
				}

				return {
					status: "success",
					data: {
						chat,
						messages,
						pagination
					}
				};
			}

			throw new Error(`Error en respuesta del servidor: ${validatedResponse.status}`);
		} catch (error) {
			console.error(`ChatService (${this.serviceId}): Error al obtener detalles del chat ${chatId}:`, error);
			throw error;
		}
	}

	/**
	 * Obtiene mensajes de un chat con paginación
	 */
	async getMessages(
		chatId: number,
		page: number = 1,
		limit: number = 20
	): Promise<MessagesResponse> {
		try {
			const endpoint = this.getEndpoint("GET_MESSAGES", chatId);
			const response = await ApiClient.get<any>(
				`${endpoint}?page=${page}&limit=${limit}`
			);

			const validatedResponse = this.validateApiResponse<any>(response);

			if (!validatedResponse) {
				throw new Error(`No se pudieron obtener los mensajes del chat ${chatId}`);
			}

			const messages: Message[] = validatedResponse.data?.messages || [];
			const pagination = validatedResponse.data?.pagination || {
				currentPage: page,
				limit: limit,
				total: 0
			};

			return {
				status: "success",
				data: {
					messages,
					pagination
				}
			};
		} catch (error) {
			console.error(`ChatService (${this.serviceId}): Error al obtener mensajes del chat ${chatId}:`, error);
			throw error;
		}
	}

	/**
	 * Envía un mensaje a un chat - CORREGIDO para manejar filtro de contenido
	 */
	async sendMessage(
		chatId: number,
		message: SendMessageRequest
	): Promise<MessageResponse> {
		try {
			console.log(`ChatService (${this.serviceId}): Enviando mensaje al chat ${chatId}`);

			if (!chatId || !message.content.trim()) {
				throw new Error("ID de chat o contenido del mensaje inválidos");
			}

			const endpoint = this.getEndpoint("SEND_MESSAGE", chatId);
			const response = await ApiClient.post<any>(endpoint, message);

			const validatedResponse = this.validateApiResponse<any>(response);

			if (!validatedResponse) {
				throw new Error("No se recibió respuesta al enviar mensaje");
			}

			// Manejar respuesta de filtro de contenido
			if (validatedResponse.status === "error") {
				// Re-lanzar el error completo para que el hook lo maneje
				const error = new Error(validatedResponse.message);
				(error as any).response = { data: validatedResponse };
				throw error;
			}

			// Respuesta exitosa
			if (validatedResponse.status === "success") {
				return {
					status: validatedResponse.status,
					message: validatedResponse.message || "Mensaje enviado",
					data: {
						message: validatedResponse.data?.message || {
							id: Date.now(),
							chatId: chatId,
							senderId: 0,
							content: message.content,
							isRead: false,
							createdAt: new Date().toISOString()
						}
					}
				};
			}

			throw new Error("Formato de respuesta inesperado");
		} catch (error) {
			console.error(`ChatService (${this.serviceId}): Error al enviar mensaje:`, error);
			throw error;
		}
	}

	/**
	 * Crea un nuevo chat con un vendedor para un producto
	 */
	async createChat(data: CreateChatRequest): Promise<CreateChatResponse> {
		try {
			console.log(`ChatService (${this.serviceId}): Creando chat`);

			if (!data.seller_id || !data.product_id) {
				throw new Error("ID de vendedor o producto inválidos");
			}

			const endpoint = this.getEndpoint("CREATE");
			const response = await ApiClient.post<any>(endpoint, data);

			const validatedResponse = this.validateApiResponse<any>(response);

			if (!validatedResponse) {
				throw new Error("Formato de respuesta inesperado al crear chat");
			}

			// Manejar diferentes formatos de respuesta
			if (validatedResponse.status === "success") {
				const chatId = validatedResponse.data?.chat_id || 
							   validatedResponse.data?.id || 
							   validatedResponse.id;

				if (chatId) {
					return {
						status: "success",
						message: validatedResponse.message || "Chat creado correctamente",
						data: { chat_id: chatId }
					};
				}
			}

			throw new Error("No se pudo obtener el ID del chat creado");
		} catch (error) {
			console.error(`ChatService (${this.serviceId}): Error al crear chat:`, error);
			throw error;
		}
	}

	/**
	 * Actualiza el estado de un chat
	 */
	async updateChatStatus(
		chatId: number,
		data: UpdateChatStatusRequest
	): Promise<UpdateChatStatusResponse> {
		try {
			if (!chatId || !data.status) {
				throw new Error("ID de chat o estado inválidos");
			}

			const endpoint = this.getEndpoint("UPDATE_STATUS", chatId);
			const response = await ApiClient.put<any>(endpoint, data);

			const validatedResponse = this.validateApiResponse<any>(response);

			if (!validatedResponse) {
				throw new Error("No se recibió respuesta al actualizar estado");
			}

			return {
				status: validatedResponse.status || "success",
				message: validatedResponse.message || `Chat ${data.status} correctamente`,
				data: {
					chat_id: validatedResponse.data?.chat_id || chatId,
					status: validatedResponse.data?.status || data.status
				}
			};
		} catch (error) {
			console.error(`ChatService (${this.serviceId}): Error al actualizar estado del chat ${chatId}:`, error);
			throw error;
		}
	}

	/**
	 * Marca todos los mensajes de un chat como leídos
	 */
	async markAllMessagesAsRead(chatId: number): Promise<MarkAsReadResponse> {
		try {
			const endpoint = this.getEndpoint("MARK_ALL_READ", chatId);
			const response = await ApiClient.post<any>(endpoint, {});

			const validatedResponse = this.validateApiResponse<any>(response);

			if (!validatedResponse) {
				throw new Error("No se recibió respuesta al marcar mensajes como leídos");
			}

			return {
				status: validatedResponse.status || "success",
				message: validatedResponse.message || "Mensajes marcados como leídos"
			};
		} catch (error) {
			console.error(`ChatService (${this.serviceId}): Error al marcar mensajes como leídos:`, error);
			throw error;
		}
	}

	/**
	 * Marca un mensaje específico como leído
	 */
	async markMessageAsRead(
		chatId: number,
		messageId: number
	): Promise<MarkAsReadResponse> {
		try {
			const endpoint = this.getEndpoint("MARK_MESSAGE_READ", chatId, messageId);
			const response = await ApiClient.patch<any>(endpoint, {});

			const validatedResponse = this.validateApiResponse<any>(response);

			if (!validatedResponse) {
				throw new Error("No se recibió respuesta al marcar mensaje como leído");
			}

			return {
				status: validatedResponse.status || "success",
				message: validatedResponse.message || "Mensaje marcado como leído"
			};
		} catch (error) {
			console.error(`ChatService (${this.serviceId}): Error al marcar mensaje como leído:`, error);
			throw error;
		}
	}

	/**
	 * Elimina (archiva) un chat
	 */
	async deleteChat(chatId: number): Promise<MarkAsReadResponse> {
		try {
			const endpoint = this.getEndpoint("DELETE", chatId);
			const response = await ApiClient.delete<any>(endpoint);

			const validatedResponse = this.validateApiResponse<any>(response);

			if (!validatedResponse) {
				throw new Error("No se recibió respuesta al eliminar chat");
			}

			return {
				status: validatedResponse.status || "success",
				message: validatedResponse.message || "Chat eliminado correctamente"
			};
		} catch (error) {
			console.error(`ChatService (${this.serviceId}): Error al eliminar chat:`, error);
			throw error;
		}
	}

	/**
	 * Obtiene chats por ID de vendedor (método explícito)
	 */
	async getChatsBySellerIdExplicit(id: number): Promise<ChatListResponse> {
		try {
			console.log(`ChatService (${this.serviceId}): Obteniendo chats para vendedor ID ${id}`);

			const endpoint = API_ENDPOINTS.CHAT.SELLER.LIST_BY_SELLER(id);
			const response = await ApiClient.get<any>(endpoint);

			const validatedResponse = this.validateApiResponse<any>(response);

			if (!validatedResponse) {
				return { status: "error", data: [] };
			}

			if (validatedResponse.status === "success") {
				const data = Array.isArray(validatedResponse.data) 
					? validatedResponse.data 
					: validatedResponse.data?.data || [];
				
				return {
					status: "success",
					data: data,
					meta: validatedResponse.data?.meta
				};
			} else if (Array.isArray(validatedResponse)) {
				return {
					status: "success",
					data: validatedResponse
				};
			}

			return { status: "success", data: [] };
		} catch (error) {
			console.error(`ChatService (${this.serviceId}): Error al obtener chats para vendedor ID ${id}:`, error);
			throw error;
		}
	}
}

export default ChatService;