// src/core/domain/entities/Chat.ts - CORREGIDO
export interface User {
	id: number;
	name: string;
	avatar?: string;
}

export interface Seller {
	id: number;
	storeName: string;
	avatar?: string;
}

export interface Product {
	id: number;
	name: string;
	image?: string;
	price?: number;
}

export interface Message {
	id?: number;
	chatId: number;
	senderId: number;
	content: string;
	isRead: boolean;
	createdAt?: string;
	updatedAt?: string;
	sender?: User;
	isMine?: boolean; // Para indicar si el mensaje es del usuario actual
}

export interface Chat {
	id?: number;
	userId: number;
	sellerId: number;
	productId: number;
	status: "active" | "closed" | "archived";
	messages: Message[];
	createdAt?: string;
	updatedAt?: string;
	user?: User;
	seller?: Seller; // CORREGIDO: Añadido seller como entidad separada
	product?: Product;
	unreadCount?: number;
	lastMessage?: Message;
}

// Interfaces para creación y actualización
export interface ChatCreationData {
	sellerId: number;
	productId: number;
	initialMessage?: string;
}

export interface MessageCreationData {
	chatId: number;
	content: string;
}

// Respuestas del API
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

// Enums para estados de mensaje
export enum MessageStatus {
	SENDING = 'sending',
	SENT = 'sent', 
	DELIVERED = 'delivered',
	READ = 'read',
	ERROR = 'error'
}

// Interfaces para filtro de contenido
export interface ContentFilterResponse {
	status: 'error' | 'success';
	message: string;
	data?: {
		censored_content?: string;
		strike_count?: number;
		is_blocked?: boolean;
	};
}

export interface StrikeData {
	count: number;
	reason: string;
	is_blocked: boolean;
}