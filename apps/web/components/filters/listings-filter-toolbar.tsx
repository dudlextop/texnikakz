'use client';

import { useMemo } from 'react';
import type { ListingFilters } from '../../types';

interface ListingsFilterToolbarProps {
  filters: ListingFilters;
  total?: number;
  onSortChange?: (sort: NonNullable<ListingFilters['sort']>) => void;
  onReset?: () => void;
}

const sortOptions: { value: NonNullable<ListingFilters['sort']>; label: string }[] = [
  { value: 'relevance', label: 'Лучшие' },
  { value: 'newest', label: 'По дате' },
  { value: 'price_asc', label: 'Цена ↑' },
  { value: 'price_desc', label: 'Цена ↓' },
  { value: 'year_desc', label: 'Год' }
];

export function ListingsFilterToolbar({ filters, total = 0, onSortChange, onReset }: ListingsFilterToolbarProps) {
  const appliedCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => key !== 'sort' && value !== undefined && value !== '').length;
  }, [filters]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-slate-500">Найдено</span>
        <span className="text-lg font-semibold text-slate-900">{total.toLocaleString('ru-RU')} объявлений</span>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-slate-500">Сортировка</span>
          <select
            value={filters.sort ?? 'relevance'}
            onChange={(event) => onSortChange?.(event.target.value as NonNullable<ListingFilters['sort']>)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600"
        >
          Сбросить фильтры {appliedCount > 0 && `(${appliedCount})`}
        </button>
      </div>
    </div>
  );
}
