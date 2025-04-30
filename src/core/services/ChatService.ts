// src/core/services/ChatService.ts - VERSIÓN CORREGIDA
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
 * Servicio para gestionar chats y mensajes
 *
 * CORRECCIÓN: Optimizar la inicialización para evitar creaciones múltiples
 */
class ChatService {
	private readonly isSeller: boolean;
	// CORRECCIÓN: Añadir un ID único para cada instancia para depuración
	private readonly serviceId: string;

	/**
	 * Construye una instancia del servicio
	 * @param isSeller Indica si el usuario es un vendedor
	 */
	constructor(isSeller = false) {
		this.isSeller = isSeller;
		this.serviceId = `chat-service-${Date.now()}-${Math.round(Math.random() * 1000)}`;
		console.log(
			`ChatService inicializado como ${isSeller ? "vendedor" : "usuario"} (ID: ${this.serviceId})`
		);
	}

	/**
	 * Obtiene el endpoint adecuado según el rol del usuario
	 * @private
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
			// Usar endpoints específicos para vendedores
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
				// Para los que no tienen endpoints específicos de vendedor, usar los generales
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
			// Usar endpoints generales para usuarios normales
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
	 * Obtiene la lista de chats del usuario actual
	 */
	async getChats(): Promise<ChatListResponse> {
		try {
			console.log(
				`ChatService (${this.serviceId}): Obteniendo lista de chats ${this.isSeller ? "como vendedor" : "como usuario"}`
			);
			const endpoint = this.getEndpoint("LIST");
			console.log(`Usando endpoint: ${endpoint}`);

			const response = await ApiClient.get<any>(endpoint);

			// Validación mejorada de la respuesta
			if (response) {
				// Caso 1: response tiene estructura de éxito con data
				if (response.status === "success" && response.data) {
					// Si data es un array directamente
					if (Array.isArray(response.data)) {
						console.log(
							`ChatService (${this.serviceId}): Se encontraron ${response.data.length} chats`
						);
						return {
							status: "success",
							data: response.data,
						};
					}
					// Si data.data es un array (formato anidado)
					else if (response.data.data && Array.isArray(response.data.data)) {
						console.log(
							`ChatService (${this.serviceId}): Se encontraron ${response.data.data.length} chats (formato anidado)`
						);
						return {
							status: "success",
							data: response.data.data,
						};
					}
					// Si respuesta tiene otra estructura pero con datos
					else {
						console.warn(
							`ChatService (${this.serviceId}): Formato de respuesta no estándar:`,
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
						`ChatService (${this.serviceId}): Se encontraron ${response.length} chats (array directo)`
					);
					return {
						status: "success",
						data: response,
					};
				}
				// Caso 3: Otros formatos pero con status de éxito
				else if (typeof response === "object") {
					console.warn(
						`ChatService (${this.serviceId}): Formato de respuesta inesperado pero válido`,
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
				`ChatService (${this.serviceId}): No se encontraron chats o formato no reconocido`
			);
			return {
				status: "success",
				data: [],
			};
		} catch (error) {
			console.error(
				`ChatService (${this.serviceId}): Error al obtener chats ${this.isSeller ? "de vendedor" : "de usuario"}:`,
				error
			);
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
	async getChatDetails(
		chatId: number,
		page: number = 1,
		limit: number = 50
	): Promise<ChatDetailResponse> {
		try {
			console.log(
				`ChatService (${this.serviceId}): Obteniendo detalles del chat ${chatId} (página ${page}, límite ${limit}) ${this.isSeller ? "como vendedor" : "como usuario"}`
			);

			const endpoint = this.getEndpoint("DETAILS", chatId);
			console.log(`Usando endpoint: ${endpoint}`);

			const response = await ApiClient.get<any>(
				`${endpoint}?page=${page}&limit=${limit}`
			);

			// Validación mejorada
			if (response) {
				// Asegurar que response.data existe
				const responseData = response.data || {};

				// Extraer chat, mensajes y paginación
				let chat: Chat;
				let messages: Message[] = [];
				let pagination = {
					currentPage: page,
					limit: limit,
					total: 0,
				};

				// Caso 1: Respuesta con estructura esperada
				if (responseData.chat && Array.isArray(responseData.messages)) {
					chat = responseData.chat;
					messages = responseData.messages;
					pagination = responseData.pagination || pagination;
				}
				// Caso 2: Respuesta con data anidada
				else if (responseData.data) {
					if (
						responseData.data.chat &&
						Array.isArray(responseData.data.messages)
					) {
						chat = responseData.data.chat;
						messages = responseData.data.messages;
						pagination = responseData.data.pagination || pagination;
					}
					// Caso 3: La respuesta tiene estructura diferente
					else if (responseData.data.id) {
						chat = responseData.data;
						messages = chat.messages || [];
					}
				}
				// Fallback: Si no podemos identificar un chat, creamos uno básico con el ID proporcionado
				else {
					console.warn(
						`ChatService (${this.serviceId}): Respuesta no estándar para chat ${chatId}, construyendo objeto básico`
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
						`ChatService (${this.serviceId}): Chat sin ID en la respuesta, asignando ${chatId}`
					);
					chat.id = chatId;
				}

				return {
					status: "success",
					data: {
						chat,
						messages,
						pagination,
					},
				};
			}

			throw new Error(`No se pudo obtener información del chat ${chatId}`);
		} catch (error) {
			console.error(
				`ChatService (${this.serviceId}): Error al obtener detalles del chat ${chatId} ${this.isSeller ? "como vendedor" : "como usuario"}:`,
				error
			);
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
			console.log(
				`ChatService (${this.serviceId}): Obteniendo mensajes del chat ${chatId} (página ${page}, límite ${limit}) ${this.isSeller ? "como vendedor" : "como usuario"}`
			);

			const endpoint = this.getEndpoint("GET_MESSAGES", chatId);
			console.log(`Usando endpoint: ${endpoint}`);

			const response = await ApiClient.get<any>(
				`${endpoint}?page=${page}&limit=${limit}`
			);

			if (!response) {
				throw new Error(
					`No se pudieron obtener los mensajes del chat ${chatId}`
				);
			}

			// Extraer mensajes y paginación
			let messages: Message[] = [];
			let pagination = {
				currentPage: page,
				limit: limit,
				total: 0,
			};

			if (response.status === "success" && response.data) {
				if (Array.isArray(response.data.messages)) {
					messages = response.data.messages;
					pagination = response.data.pagination || pagination;
				} else if (
					response.data.data &&
					Array.isArray(response.data.data.messages)
				) {
					messages = response.data.data.messages;
					pagination = response.data.data.pagination || pagination;
				}
			}

			return {
				status: "success",
				data: {
					messages,
					pagination,
				},
			};
		} catch (error) {
			console.error(
				`ChatService (${this.serviceId}): Error al obtener mensajes del chat ${chatId} ${this.isSeller ? "como vendedor" : "como usuario"}:`,
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
			console.log(
				`ChatService (${this.serviceId}): Enviando mensaje al chat ${chatId} ${this.isSeller ? "como vendedor" : "como usuario"}`
			);

			// Validar parámetros
			if (!chatId || !message.content.trim()) {
				throw new Error(
					`ChatService (${this.serviceId}): ID de chat o contenido del mensaje inválidos`
				);
			}

			const endpoint = this.getEndpoint("SEND_MESSAGE", chatId);
			console.log(`Usando endpoint: ${endpoint}`);

			const response = await ApiClient.post<any>(endpoint, message);

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
				`ChatService (${this.serviceId}): Error al enviar mensaje al chat ${chatId} ${this.isSeller ? "como vendedor" : "como usuario"}:`,
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
				`ChatService (${this.serviceId}): Creando chat con vendedor ${data.seller_id} para producto ${data.product_id}`
			);

			// Validar parámetros
			if (!data.seller_id || !data.product_id) {
				throw new Error(
					`ChatService (${this.serviceId}): ID de vendedor o producto inválidos`
				);
			}

			const endpoint = this.getEndpoint("CREATE");
			console.log(`Usando endpoint: ${endpoint}`);

			const response = await ApiClient.post<any>(endpoint, data);

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
						`ChatService (${this.serviceId}): Respuesta de éxito sin ID de chat:`,
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
			console.error(
				`ChatService (${this.serviceId}): Error al crear chat:`,
				error
			);
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
				`ChatService (${this.serviceId}): Actualizando estado del chat ${chatId} a ${data.status} ${this.isSeller ? "como vendedor" : "como usuario"}`
			);

			// Validar parámetros
			if (!chatId || !data.status) {
				throw new Error(
					`ChatService (${this.serviceId}): ID de chat o estado inválidos`
				);
			}

			const endpoint = this.getEndpoint("UPDATE_STATUS", chatId);
			console.log(`Usando endpoint: ${endpoint}`);

			const response = await ApiClient.put<any>(endpoint, data);

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
				`ChatService (${this.serviceId}): Error al actualizar estado del chat ${chatId} ${this.isSeller ? "como vendedor" : "como usuario"}:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Marca todos los mensajes de un chat como leídos
	 */
	async markAllMessagesAsRead(chatId: number): Promise<MarkAsReadResponse> {
		try {
			console.log(
				`ChatService (${this.serviceId}): Marcando todos los mensajes del chat ${chatId} como leídos ${this.isSeller ? "como vendedor" : "como usuario"}`
			);

			const endpoint = this.getEndpoint("MARK_ALL_READ", chatId);
			console.log(`Usando endpoint: ${endpoint}`);

			const response = await ApiClient.post<any>(endpoint, {});

			if (!response) {
				throw new Error(
					"No se recibió respuesta al marcar mensajes como leídos"
				);
			}

			return {
				status: response.status || "success",
				message: response.message || "Mensajes marcados como leídos",
			};
		} catch (error) {
			console.error(
				`ChatService (${this.serviceId}): Error al marcar mensajes como leídos en chat ${chatId} ${this.isSeller ? "como vendedor" : "como usuario"}:`,
				error
			);
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
			console.log(
				`ChatService (${this.serviceId}): Marcando mensaje ${messageId} del chat ${chatId} como leído ${this.isSeller ? "como vendedor" : "como usuario"}`
			);

			const endpoint = this.getEndpoint("MARK_MESSAGE_READ", chatId, messageId);
			console.log(`Usando endpoint: ${endpoint}`);

			const response = await ApiClient.patch<any>(endpoint, {});

			if (!response) {
				throw new Error("No se recibió respuesta al marcar mensaje como leído");
			}

			return {
				status: response.status || "success",
				message: response.message || "Mensaje marcado como leído",
			};
		} catch (error) {
			console.error(
				`ChatService (${this.serviceId}): Error al marcar mensaje ${messageId} como leído en chat ${chatId} ${this.isSeller ? "como vendedor" : "como usuario"}:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Elimina (archiva) un chat
	 */
	async deleteChat(chatId: number): Promise<MarkAsReadResponse> {
		try {
			console.log(
				`ChatService (${this.serviceId}): Eliminando chat ${chatId} ${this.isSeller ? "como vendedor" : "como usuario"}`
			);

			const endpoint = this.getEndpoint("DELETE", chatId);
			console.log(`Usando endpoint: ${endpoint}`);

			const response = await ApiClient.delete<any>(endpoint);

			if (!response) {
				throw new Error("No se recibió respuesta al eliminar chat");
			}

			return {
				status: response.status || "success",
				message: response.message || "Chat eliminado correctamente",
			};
		} catch (error) {
			console.error(
				`ChatService (${this.serviceId}): Error al eliminar chat ${chatId} ${this.isSeller ? "como vendedor" : "como usuario"}:`,
				error
			);
			throw error;
		}
	}
	/**
	 * Obtiene la lista de chats para un vendedor específico usando ID explícito
	 * Este método es un fallback para cuando la ruta principal no funciona
	 */
	async getChatsBySellerIdExplicit(id: number): Promise<ChatListResponse> {
		try {
			console.log(
				`ChatService (${this.serviceId}): Obteniendo lista de chats para vendedor con ID ${id} (búsqueda explícita)`
			);

			// Utiliza la ruta explícita usando el ID proporcionado
			// Nota: Este ID puede ser tanto un user_id como un seller_id
			// El backend se encargará de manejar ambos casos
			const endpoint = API_ENDPOINTS.CHAT.SELLER.LIST_BY_SELLER(id);
			console.log(`Usando endpoint explícito: ${endpoint}`);

			const response = await ApiClient.get<any>(endpoint);

			// Validación mejorada de la respuesta
			if (response) {
				// Caso 1: response tiene estructura de éxito con data
				if (response.status === "success" && response.data) {
					// Si data es un array directamente
					if (Array.isArray(response.data)) {
						console.log(
							`ChatService (${this.serviceId}): Se encontraron ${response.data.length} chats (método explícito)`
						);
						return {
							status: "success",
							data: response.data,
						};
					}
					// Si data.data es un array (formato anidado)
					else if (response.data.data && Array.isArray(response.data.data)) {
						console.log(
							`ChatService (${this.serviceId}): Se encontraron ${response.data.data.length} chats (método explícito, formato anidado)`
						);
						return {
							status: "success",
							data: response.data.data,
						};
					}
					// Si respuesta tiene otra estructura pero con datos
					else {
						console.warn(
							`ChatService (${this.serviceId}): Formato de respuesta no estándar en método explícito:`,
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
						`ChatService (${this.serviceId}): Se encontraron ${response.length} chats (array directo, método explícito)`
					);
					return {
						status: "success",
						data: response,
					};
				}
				// Caso 3: Otros formatos pero con status de éxito
				else if (typeof response === "object") {
					console.warn(
						`ChatService (${this.serviceId}): Formato de respuesta inesperado pero válido (método explícito)`,
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
				`ChatService (${this.serviceId}): No se encontraron chats o formato no reconocido (método explícito)`
			);
			return {
				status: "success",
				data: [],
			};
		} catch (error) {
			console.error(
				`ChatService (${this.serviceId}): Error al obtener chats para ID ${id} (método explícito):`,
				error
			);
			// Relanzamos el error para que el hook pueda manejarlo y probar el siguiente método
			throw error;
		}
	}
}

export default ChatService;
