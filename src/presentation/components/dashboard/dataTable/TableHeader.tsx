// components/TableHeader.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { TableHeaderProps } from '../../../types/dashboard/dataTable/DataTableTypes';

const TableHeader: React.FC<TableHeaderProps> = ({
  title,
  viewAllLink,
  viewAllText = "Ver todo"
}) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
        {title}
      </h2>
      {viewAllLink && (
        <Link
          to={viewAllLink}
          className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline flex items-center"
        >
          {viewAllText} <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
};

export default TableHeader;