'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { PaginationControls } from './pagination';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  header?: ReactNode;
  filters?: ReactNode;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  emptyMessage = 'Нет данных',
  header,
  filters,
  page = 1,
  pageSize = 20,
  total = data.length,
  onPageChange,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showPagination = totalPages > 1 && onPageChange;

  return (
    <section className="space-y-4">
      {header ? <div className="flex items-center justify-between gap-4">{header}</div> : null}
      {filters ? <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">{filters}</div> : null}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx('px-4 py-3 font-medium', {
                    'text-left': !column.align || column.align === 'left',
                    'text-center': column.align === 'center',
                    'text-right': column.align === 'right',
                  })}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60 bg-slate-950/30 text-slate-200">
            {loading
              ? Array.from({ length: Math.min(5, pageSize) }).map((_, index) => (
                  <tr key={`loading-${index}`} className="animate-pulse">
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3">
                        <div className="h-4 w-full rounded bg-slate-800/70" />
                      </td>
                    ))}
                  </tr>
                ))
              : null}
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : null}
            {!loading
              ? data.map((row, index) => (
                  <tr key={index} className="transition hover:bg-slate-900/70">
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={clsx('px-4 py-3 text-sm', {
                          'text-left': !column.align || column.align === 'left',
                          'text-center': column.align === 'center',
                          'text-right': column.align === 'right',
                        })}
                      >
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
      {showPagination ? (
        <PaginationControls page={page} totalPages={totalPages} onPageChange={onPageChange!} />
      ) : null}
    </section>
  );
}
