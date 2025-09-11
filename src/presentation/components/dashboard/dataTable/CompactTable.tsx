// components/CompactTable.tsx
import React from 'react';
import TableHeader from './TableHeader';
import type { Column, TableProps } from '../../../types/dashboard/dataTable/DataTableTypes';

function CompactTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  viewAllLink,
  viewAllText,
  className = "",
  onRowClick
}: TableProps<T>): React.ReactElement {
  // Helper function to render cell content based on column configuration
  const renderCellContent = (row: T, column: Column<T>) => {
    const value = row[column.key];
    
    // Use custom render function if provided
    if (column.render) {
      return column.render(value, row);
    }
    
    // Default rendering based on value type
    if (typeof value === 'undefined' || value === null) {
      return '-';
    }
    
    return value;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <TableHeader 
        title={title} 
        viewAllLink={viewAllLink} 
        viewAllText={viewAllText} 
      />
      
      {/* Compact list */}
      <div className="divide-y divide-gray-200">
        {data.map((row, rowIndex) => (
          <div 
            key={rowIndex}
            className={`px-6 py-3 flex flex-wrap items-center gap-3 hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="flex items-center">
                {column.showLabelInCompact && (
                  <span className="text-xs text-gray-500 mr-1">
                    {column.header}:
                  </span>
                )}
                <span className="text-sm">
                  {renderCellContent(row, column)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompactTable;