export interface User {
	id: number;
	name: string;
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
	product?: Product;
	unreadCount?: number;
	lastMessage?: Message;
}
