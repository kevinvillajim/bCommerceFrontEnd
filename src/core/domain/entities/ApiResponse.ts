// src/core/domain/entities/ApiResponse.ts
// Tipos para respuestas estándar de la API

export interface ApiResponse<T = any> {
	status: "success" | "error";
	message: string;
	data?: T;
	errors?: Record<string, string[]>;
	code?: string;
}

export interface PaginatedResponse<T = any> {
	data: T[];
	meta: {
		current_page: number;
		last_page: number;
		per_page: number;
		total: number;
		from: number;
		to: number;
	};
	links: {
		first: string;
		last: string;
		prev: string | null;
		next: string | null;
	};
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<PaginatedResponse<T>> {
	data: PaginatedResponse<T>;
}