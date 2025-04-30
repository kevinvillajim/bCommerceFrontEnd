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
			console.log("ChatService: Obteniendo lista de chats");
			const response = await ApiClient.get<any>(API_ENDPOINTS.CHAT.LIST);

			// Validación mejorada de la respuesta
			if (response) {
				// Caso 1: response tiene estructura de éxito con data
				if (response.status === "success" && response.data) {
					// Si data es un array directamente
					if (Array.isArray(response.data)) {
						console.log(
							`ChatService: Se encontraron ${response.data.length} chats`
						);
						return {
							status: "success",
							data: response.data,
						};
					}
					// Si data.data es un array (formato anidado)
					else if (response.data.data && Array.isArray(response.data.data)) {
						console.log(
							`ChatService: Se encontraron ${response.data.data.length} chats (formato anidado)`
						);
						return {
							status: "success",
							data: response.data.data,
						};
					}
					// Si respuesta tiene otra estructura pero con datos
					else {
						console.warn(
							"ChatService: Formato de respuesta no estándar:",
							response
						);
						return {
							status: "success",
							data: [],
						};
					}
				}
				// Caso 2: respuesta es directamente un array
				else if (Array.isArray(response)) {
					console.log(
						`ChatService: Se encontraron ${response.length} chats (array directo)`
					);
					return {
						status: "success",
						data: response,
					};
				}
				// Caso 3: Otros formatos pero con status de éxito
				else if (typeof response === "object") {
					console.warn(
						"ChatService: Formato de respuesta inesperado pero válido",
						response
					);
					return {
						status: "success",
						data: [],
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
				let chat: Chat;
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
				else if (
					responseData.id ||
					(responseData.data && responseData.data.id)
				) {
					chat = responseData.id ? responseData : responseData.data;
					// En este caso, los mensajes podrían estar en .messages o ser un array separado
					messages = chat.messages || [];
				}
				// Fallback: Si no podemos identificar un chat, creamos uno básico con el ID proporcionado
				else {
					console.warn(
						`ChatService: Respuesta no estándar para chat ${chatId}, construyendo objeto básico`
					);
					chat = {
						id: chatId,
						userId: 0,
						sellerId: 0,
						productId: 0,
						status: "active",
						messages: [],
					};
				}

				// Asegurar que el chat tiene ID
				if (!chat.id) {
					console.warn(
						`ChatService: Chat sin ID en la respuesta, asignando ${chatId}`
					);
					chat.id = chatId;
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

			// Validar parámetros
			if (!chatId || !message.content.trim()) {
				throw new Error(
					"ChatService: ID de chat o contenido del mensaje inválidos"
				);
			}

			const response = await ApiClient.post<any>(
				API_ENDPOINTS.CHAT.SEND_MESSAGE(chatId),
				message
			);

			if (!response) {
				throw new Error("No se recibió respuesta al enviar mensaje");
			}

			// Si la respuesta tiene la estructura esperada
			if (
				response.status === "success" &&
				response.data &&
				response.data.message
			) {
				return {
					status: response.status,
					message: response.message || "Mensaje enviado",
					data: response.data,
				};
			}

			// Intentar adaptar la respuesta si tiene otra estructura
			return {
				status: response.status || "success",
				message: response.message || "Mensaje enviado",
				data: {
					message: response.message ||
						response.data || {
							id: Date.now(),
							chatId: chatId,
							senderId: 0, // Se sobreescribirá en el hook
							content: message.content,
							isRead: false,
							createdAt: new Date().toISOString(),
						},
				},
			};
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
	 */
	async createChat(data: CreateChatRequest): Promise<CreateChatResponse> {
		try {
			console.log(
				`ChatService: Creando chat con vendedor ${data.seller_id} para producto ${data.product_id}`
			);

			// Validar parámetros
			if (!data.seller_id || !data.product_id) {
				throw new Error("ChatService: ID de vendedor o producto inválidos");
			}

			const response = await ApiClient.post<any>(
				API_ENDPOINTS.CHAT.CREATE,
				data
			);

			// Validación y adaptación de respuesta
			if (response) {
				// Si la respuesta tiene la estructura esperada
				if (response.data && response.data.chat_id) {
					return {
						status: "success",
						message: response.message || "Chat creado correctamente",
						data: {
							chat_id: response.data.chat_id,
						},
					};
				}

				// Si la respuesta tiene otra estructura pero contiene el ID del chat
				if (response.data && response.data.id) {
					return {
						status: "success",
						message: "Chat creado correctamente",
						data: {
							chat_id: response.data.id,
						},
					};
				}

				// Si la respuesta es un objeto con id directamente
				if (response.id) {
					return {
						status: "success",
						message: "Chat creado correctamente",
						data: {
							chat_id: response.id,
						},
					};
				}

				// Si no encontramos un ID pero la respuesta indica éxito
				if (response.status === "success") {
					console.warn(
						"ChatService: Respuesta de éxito sin ID de chat:",
						response
					);
					return {
						status: "success",
						message: "Chat creado, pero no se recibió su ID",
						data: {
							chat_id: 0, // Se manejará en el hook
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

			// Validar parámetros
			if (!chatId || !data.status) {
				throw new Error("ChatService: ID de chat o estado inválidos");
			}

			const response = await ApiClient.put<any>(
				API_ENDPOINTS.CHAT.UPDATE_STATUS(chatId),
				data
			);

			// Validación y adaptación
			if (response) {
				// Si la respuesta tiene la estructura esperada
				if (response.status === "success" && response.data) {
					return {
						status: "success",
						message: response.message || `Chat ${data.status} correctamente`,
						data: {
							chat_id: response.data.chat_id || chatId,
							status: response.data.status || data.status,
						},
					};
				}

				// Adaptar respuesta para mantener consistencia
				return {
					status: response.status || "success",
					message: response.message || `Chat ${data.status} correctamente`,
					data: {
						chat_id: chatId,
						status: data.status,
					},
				};
			}

			throw new Error("No se recibió respuesta al actualizar estado");
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
