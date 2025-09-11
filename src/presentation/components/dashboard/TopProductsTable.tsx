import React from "react";
import {Link} from "react-router-dom";
import DataTable from "./dataTable/DataTable";
import {formatCurrency} from "../../../utils/formatters/formatCurrency";
import type {
	Product,
	Column,
	BaseTableProps,
	TableHeaderProps,
} from "../../types/dashboard/dataTable/DataTableTypes";

// Columnas para la tabla de productos más vendidos
const getTopProductColumns = (): Column<Product>[] => [
	{
		key: "name",
		header: "Producto",
		render: (value, row) => (
			<Link
				to={`/seller/products/edit/${row.id}`}
				className="text-primary-600 hover:underline font-medium"
			>
				{value}
			</Link>
		),
	},
	{
		key: "sold",
		header: "Unidades Vendidas",
	},
	{
		key: "revenue",
		header: "Ingresos",
		render: (value) => formatCurrency(value),
	},
];

interface TopProductsTableProps extends BaseTableProps, TableHeaderProps {
	products: Product[];
	compact?: boolean;
	onProductClick?: (product: Product) => void;
}

const TopProductsTable: React.FC<TopProductsTableProps> = ({
	products,
	title,
	viewAllLink,
	viewAllText,
	compact = false,
	className = "",
	onProductClick,
}) => {
	return (
		<DataTable<Product>
			data={products}
			columns={getTopProductColumns()}
			title={title}
			viewAllLink={viewAllLink}
			viewAllText={viewAllText}
			compact={compact}
			className={className}
			onRowClick={onProductClick}
		/>
	);
};

export default TopProductsTable;
