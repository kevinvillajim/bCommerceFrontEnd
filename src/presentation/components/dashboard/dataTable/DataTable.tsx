import React from 'react';
import EmptyState from './EmptyState';
import StandardTable from './StandardTable';
import CompactTable from './CompactTable';
import type { TableProps } from '../../../types/dashboard/dataTable/DataTableTypes';

// This is a factory component that decides which type of table to render
function DataTable<T extends Record<string, any>>(props: TableProps<T>): React.ReactElement {
  const { data, compact = false } = props;

  // Show empty state if no data
  if (!data || data.length === 0) {
    return <EmptyState title={props.title} className={props.className} />;
  }

  // Return the appropriate table based on the compact flag
  return compact 
    ? <CompactTable<T> {...props} />
    : <StandardTable<T> {...props} />;
}

export default DataTable;