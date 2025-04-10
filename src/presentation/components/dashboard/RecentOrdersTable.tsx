import React from "react";
import {Link} from "react-router-dom";
import DataTable from "./dataTable/DataTable";
import type {
	Order,
	Column,
	BaseTableProps,
	TableHeaderProps,
} from "../../types/dashboard/dataTable/DataTableTypes";
import { formatCurrency } from "@/utils/formatters/formatCurrency";



// Columnas para la tabla de pedidos recientes
const getOrderColumns = (): Column<Order>[] => [
	{
		key: "id",
		header: "ID Pedido",
		render: (value, row) => (
			<Link
				to={`/seller/orders/${row.id}`}
				className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
			>
				#{value}
			</Link>
		),
	},
	{
		key: "date",
		header: "Fecha",
	},
	{
		key: "customer",
		header: "Cliente",
	},
	{
		key: "total",
		header: "Total",
		render: (value) => formatCurrency(value),
	},
	{
		key: "status",
		header: "Estado",
		render: (value: Order["status"]) => {
			const statusMap = {
				Completed: {
					text: "Completado",
					classes:
						"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
				},
				Shipped: {
					text: "Enviado",
					classes:
						"bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
				},
				Processing: {
					text: "En Proceso",
					classes:
						"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
				},
			};

			const statusInfo = statusMap[value] || {text: value, classes: ""};

			return (
				<span
					className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.classes}`}
				>
					{statusInfo.text}
				</span>
			);
		},
	},
];

interface RecentOrdersTableProps extends BaseTableProps, TableHeaderProps {
	orders: Order[];
	compact?: boolean;
	onOrderClick?: (order: Order) => void;
}

const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
	orders,
	title,
	viewAllLink,
	viewAllText,
	compact = false,
	className = "",
	onOrderClick,
}) => {
	return (
		<DataTable<Order>
			data={orders}
			columns={getOrderColumns()}
			title={title}
			viewAllLink={viewAllLink}
			viewAllText={viewAllText}
			compact={compact}
			className={className}
			onRowClick={onOrderClick}
		/>
	);
};

export default RecentOrdersTable;
