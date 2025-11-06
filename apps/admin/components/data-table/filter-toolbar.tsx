'use client';

import { ReactNode } from 'react';

interface DataTableFiltersProps {
  onReset?: () => void;
  children: ReactNode;
}

export function DataTableFilters({ onReset, children }: DataTableFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="grid flex-1 gap-3 md:grid-cols-2 lg:grid-cols-3">{children}</div>
      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 w-full items-center justify-center rounded-md border border-slate-700 bg-slate-900 px-4 text-sm font-medium text-slate-200 transition hover:bg-slate-800 md:w-auto"
        >
          Сбросить фильтры
        </button>
      ) : null}
    </div>
  );
}
