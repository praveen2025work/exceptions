import React, { useMemo, useCallback, useState, useEffect } from 'react';
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

// Simple virtualization implementation without external dependencies
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
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(height - 50);

  const handleSort = useCallback((field: string) => {
    if (!onSort) return;
    
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(field, newDirection);
  }, [onSort, sortField, sortDirection]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Calculate visible range for virtualization
  const visibleRange = useMemo(() => {
    const overscan = 5;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      data.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, itemHeight, data.length]);

  const visibleItems = useMemo(() => {
    return data.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [data, visibleRange]);

  const totalHeight = data.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

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
        className="flex-1 overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleItems.map((item, index) => {
              const actualIndex = visibleRange.startIndex + index;
              const style: React.CSSProperties = {
                height: itemHeight,
                display: 'flex',
                alignItems: 'center'
              };
              return (
                <div key={item.id || actualIndex}>
                  {renderRow(item, actualIndex, style)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(VirtualizedTable);