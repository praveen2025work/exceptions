import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Exception } from '@/types/exception';

interface VirtualizedTableProps {
  data: Exception[];
  height: number;
  itemHeight?: number;
  onRowClick?: (item: Exception) => void;
  renderRow: (item: Exception, index: number, style: React.CSSProperties) => React.ReactNode;
  headers: Array<{
    key: string;
    label: string;
    width?: string;
    sortable?: boolean;
  }>;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

const VirtualizedTable: React.FC<VirtualizedTableProps> = ({
  data,
  height,
  itemHeight = 50,
  onRowClick,
  renderRow,
  headers,
  onSort,
  sortField,
  sortDirection
}) => {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = data[index];
    if (!item) return null;

    return (
      <div style={style}>
        {renderRow(item, index, style)}
      </div>
    );
  }, [data, renderRow]);

  const handleSort = useCallback((field: string) => {
    if (!onSort) return;
    
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(field, newDirection);
  }, [onSort, sortField, sortDirection]);

  return (
    <div className="h-full flex flex-col">
      {/* Table Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {headers.map((header) => (
                <TableHead
                  key={header.key}
                  className={`bg-background ${header.width || 'min-w-[100px]'} ${
                    header.sortable ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => header.sortable && handleSort(header.key)}
                >
                  <div className="flex items-center text-xs font-semibold">
                    {header.label}
                    {header.sortable && sortField === header.key && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      {/* Virtualized Table Body */}
      <div 
        ref={setContainerRef}
        className="flex-1 overflow-hidden"
        style={{ height: height - 50 }} // Subtract header height
      >
        {containerRef && (
          <List
            height={height - 50}
            itemCount={data.length}
            itemSize={itemHeight}
            width="100%"
            overscanCount={5}
          >
            {Row}
          </List>
        )}
      </div>
    </div>
  );
};

export default React.memo(VirtualizedTable);