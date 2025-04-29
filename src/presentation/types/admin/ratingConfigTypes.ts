// Interfaces para las respuestas de API
export interface ApiResponse<T = any> {
	status: string;
	message?: string;
	data?: T;
}

// Interfaces para configuraciones
export interface RatingConfig {
	value: boolean | number | string;
	description: string;
	type: string;
}

export interface RatingConfigs {
	[key: string]: RatingConfig;
}

// Interfaces para estadísticas
export interface RatingStats {
	totalCount: number;
	approvedCount: number;
	pendingCount: number;
	rejectedCount: number;
}

// Interface para la respuesta de aprobación masiva
export interface ApproveAllResponse {
	count: number;
}
