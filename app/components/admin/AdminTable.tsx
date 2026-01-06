'use client';

import React from 'react';
import { cn } from '@/app/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
}

interface AdminTableProps {
  data: any[];
  columns: Column[];
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
  };
  actions?: {
    label: string;
    onClick: (row: any) => void;
    icon?: React.ReactNode;
    variant?: 'default' | 'destructive';
  }[];
  onRowClick?: (row: any) => void;
  className?: string;
  emptyState?: {
    title: string;
    description: string;
    icon?: React.ReactNode;
  };
}

export default function AdminTable({
  data,
  columns,
  loading = false,
  pagination,
  actions,
  onRowClick,
  className,
  emptyState
}: AdminTableProps) {
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const getSortIcon = (column: Column) => {
    if (!column.sortable || !sortConfig || sortConfig.key !== column.key) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }

    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-blue-600" />
      : <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

  const renderCell = (column: Column, row: any) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row);
    }

    return (
      <span className={cn('text-sm', column.className)}>
        {value}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {columns.map((column) => (
                  <TableHead key={column.key} className="font-semibold text-gray-900">
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index} className="animate-pulse">
                  {columns.map((column) => (
                    <TableCell key={column.key} className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="text-center py-16">
            {emptyState?.icon || (
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              </div>
            )}
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {emptyState?.title || 'No data available'}
            </h3>
            <p className="text-gray-600">
              {emptyState?.description || 'There are no items to display'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {columns.map((column) => (
                <TableHead 
                  key={column.key} 
                  className={cn(
                    'font-semibold text-gray-900',
                    column.sortable && 'cursor-pointer hover:bg-gray-100 transition-colors'
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    {column.sortable && getSortIcon(column)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row, index) => (
              <TableRow 
                key={row.id || index}
                className={cn(
                  'hover:bg-gray-50 transition-colors border-b',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className="py-4">
                    {renderCell(column, row)}
                  </TableCell>
                ))}
                {actions && actions.length > 0 && (
                  <TableCell className="py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {actions.map((action, actionIndex) => (
                        <Button
                          key={actionIndex}
                          variant={action.variant === 'destructive' ? 'destructive' : 'ghost'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          {action.icon || <MoreHorizontal className="h-4 w-4" />}
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === pagination.currentPage;
                  
                  // Show pages around current page
                  let showPage = false;
                  if (pageNum === 1 || pageNum === pagination.totalPages) {
                    showPage = true;
                  } else if (Math.abs(pageNum - pagination.currentPage) <= 1) {
                    showPage = true;
                  }
                  
                  if (showPage) {
                    return (
                      <Button
                        key={pageNum}
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => pagination.onPageChange(pageNum)}
                        className={cn(
                          'h-8 w-8 p-0',
                          isActive && 'bg-blue-600 text-white'
                        )}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                  
                  // Show ellipsis for skipped pages
                  if (pageNum === pagination.currentPage - 2 || pageNum === pagination.currentPage + 2) {
                    return (
                      <span key={pageNum} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  
                  return null;
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
