export interface BaseTableProps {
	className?: string;
}

export interface TableHeaderProps {
	title: string;
	viewAllLink?: string;
	viewAllText?: string;
}

export interface Column<T> {
	key: keyof T;
	header: string;
	showLabelInCompact?: boolean;
	render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T> extends BaseTableProps, TableHeaderProps {
	data: T[];
	columns: Column<T>[];
	compact?: boolean;
	onRowClick?: (row: T) => void;
}

// Definición de tipos específicos para nuestros casos de uso
export interface Order {
	id: string;
	date: string;
	customer: string;
	total: number;
	status: "Completed" | "Processing" | "Shipped";
}

export interface Seller {
	id: number;
	name: string;
	orderCount: number;
	revenue: number;
}

export interface Product {
	id: number;
	name: string;
	sold: number;
	revenue: number;
}