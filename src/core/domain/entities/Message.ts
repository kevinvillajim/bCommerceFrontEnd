// src/core/domain/entities/Message.ts - CORREGIDO
/**
 * Message entity
 */
export interface Message {
  id?: number;
  chatId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Campos útiles para la UI
  sender?: {
    id: number;
    name: string;
    avatar?: string;
  };
  isMine?: boolean; // Helper para la UI
}

/**
 * Chat entity - CORREGIDO
 */
export interface Chat {
  id?: number;
  userId: number;
  sellerId: number;
  productId: number;
  status: 'active' | 'closed' | 'archived';
  messages: Message[];
  createdAt?: string;
  updatedAt?: string;
  // Campos relacionados para UI
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
  seller?: {
    id: number;
    storeName: string;
    avatar?: string;
  };
  product?: {
    id: number;
    name: string;
    image?: string;
    price?: number;
  };
  unreadCount?: number;
  lastMessage?: Message;
}

/**
 * Message creation data
 */
export interface MessageCreationData {
  chatId: number;
  content: string;
}

/**
 * Chat creation data
 */
export interface ChatCreationData {
  sellerId: number;
  productId: number;
  initialMessage?: string;
}

/**
 * Chat list response
 */
export interface ChatListResponse {
  data: Chat[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

/**
 * Chat detail response
 */
export interface ChatDetailResponse {
  data: Chat;
}

/**
 * Message list response
 */
export interface MessageListResponse {
  data: Message[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    chat: {
      id: number;
      userId: number;
      sellerId: number;
      productId: number;
      status: string;
    };
  };
}

/**
 * New message response
 */
export interface NewMessageResponse {
  status: string;
  message: string;
  data: {
    message: Message;
  };
}

/**
 * Mark message as read request
 */
export interface MarkMessageReadRequest {
  messageId: number;
}

/**
 * Mark all messages as read request
 */
export interface MarkAllMessagesReadRequest {
  chatId: number;
}

/**
 * Update chat status request
 */
export interface UpdateChatStatusRequest {
  status: 'active' | 'closed' | 'archived';
}

/**
 * Chat filter params
 */
export interface ChatFilterParams {
  userId?: number;
  sellerId?: number;
  productId?: number;
  status?: string;
  hasUnread?: boolean;
  search?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// Enums para estados de mensaje
export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  ERROR = 'error'
}

// Interfaces para respuestas de filtro de contenido
export interface ContentFilterResponse {
  status: 'error' | 'success';
  message: string;
  data?: {
    censored_content?: string;
    strike_count?: number;
    is_blocked?: boolean;
  };
}