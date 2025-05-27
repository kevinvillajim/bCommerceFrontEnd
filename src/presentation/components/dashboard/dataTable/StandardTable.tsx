// components/StandardTable.tsx
import React from 'react';
import TableHeader from './TableHeader';
import type { Column, TableProps } from '../../../types/dashboard/dataTable/DataTableTypes';

function StandardTable<T extends Record<string, any>>({
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
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={index} 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column, colIndex) => (
                  <td 
                    key={colIndex} 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {renderCellContent(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StandardTable;