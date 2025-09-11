import React from 'react';
import type { TableHeaderProps } from '../../../types/dashboard/dataTable/DataTableTypes';

interface EmptyStateProps extends TableHeaderProps {
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  className = ""
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
      </div>
      <div className="p-6 text-center text-gray-500">
        No hay datos disponibles
      </div>
    </div>
  );
};

export default EmptyState;