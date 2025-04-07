import React from 'react';
import { Link } from 'react-router-dom';
import DataTable from './dataTable/DataTable';
import type { Seller, Column, BaseTableProps, TableHeaderProps } from '../../types/dashboard/dataTable/DataTableTypes';

// Utility function for formatting currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

// Define the columns for the sellers table
const getSellerColumns = (): Column<Seller>[] => [
  {
    key: 'name',
    header: 'Vendedor',
    showLabelInCompact: false,
    render: (value, row) => (
      <Link to={`/admin/sellers/${row.id}`} className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
        {value}
      </Link>
    )
  },
  {
    key: 'orderCount',
    header: 'Pedidos',
    showLabelInCompact: true
  },
  {
    key: 'revenue',
    header: 'Ingresos',
    showLabelInCompact: true,
    render: (value) => formatCurrency(value)
  }
];

interface SellersTableProps extends BaseTableProps, TableHeaderProps {
  sellers: Seller[];
  compact?: boolean;
  onSellerClick?: (seller: Seller) => void;
}

const SellersTable: React.FC<SellersTableProps> = ({
  sellers,
  title,
  viewAllLink,
  viewAllText,
  compact = false,
  className = "",
  onSellerClick
}) => {
  return (
    <DataTable<Seller>
      data={sellers}
      columns={getSellerColumns()}
      title={title}
      viewAllLink={viewAllLink}
      viewAllText={viewAllText}
      compact={compact}
      className={className}
      onRowClick={onSellerClick}
    />
  );
};

export default SellersTable;