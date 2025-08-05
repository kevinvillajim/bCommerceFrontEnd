import React from 'react';
import { Link } from 'react-router-dom';
import DataTable from './dataTable/DataTable';
import { formatCurrency } from '../../../utils/formatters/formatCurrency';
import type { Order, Column, BaseTableProps, TableHeaderProps } from '../../types/dashboard/dataTable/DataTableTypes';

// Define the columns for the orders table
const getOrderColumns = (): Column<Order>[] => [
  {
    key: 'id',
    header: 'ID Pedido',
    showLabelInCompact: false,
    render: (value) => (
      <Link to={`/admin/orders/${value}`} className="text-primary-600 hover:underline font-medium">
        #{value}
      </Link>
    )
  },
  {
    key: 'date',
    header: 'Fecha',
    showLabelInCompact: true
  },
  {
    key: 'customer',
    header: 'Cliente',
    showLabelInCompact: true,
    render: (value) => (
      <span className="text-gray-900">{value}</span>
    )
  },
  {
    key: 'total',
    header: 'Total',
    showLabelInCompact: true,
    render: (value) => formatCurrency(value)
  },
  {
    key: 'status',
    header: 'Estado',
    showLabelInCompact: true,
    render: (value) => {
      let bgColorClass = 'bg-yellow-100 text-yellow-800';
      let displayText = 'En Proceso';
      
      if (value === 'Completed') {
        bgColorClass = 'bg-green-100 text-green-800';
        displayText = 'Completado';
      } else if (value === 'Shipped') {
        bgColorClass = 'bg-blue-100 text-blue-800';
        displayText = 'Enviado';
      }
      
      return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColorClass}`}>
          {displayText}
        </span>
      );
    }
  }
];

interface OrdersTableProps extends BaseTableProps, TableHeaderProps {
  orders: Order[];
  compact?: boolean;
  onOrderClick?: (order: Order) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  title,
  viewAllLink,
  viewAllText,
  compact = false,
  className = "",
  onOrderClick
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

export default OrdersTable;