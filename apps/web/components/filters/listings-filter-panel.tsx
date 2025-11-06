'use client';

import { useState } from 'react';
import type { ListingFacetOption, ListingFilters } from '../../types';

interface ListingsFilterPanelProps {
  initialFilters: ListingFilters;
  categories?: ListingFacetOption[];
  cities?: ListingFacetOption[];
  onApply?: (filters: ListingFilters) => void;
}

export function ListingsFilterPanel({ initialFilters, categories = [], cities = [], onApply }: ListingsFilterPanelProps) {
  const [filters, setFilters] = useState<ListingFilters>(initialFilters);

  const update = <Key extends keyof ListingFilters>(key: Key, value: ListingFilters[Key]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const apply = () => {
    onApply?.(filters);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Категория</p>
        <select
          value={filters.categoryId ?? ''}
          onChange={(event) => update('categoryId', event.target.value || undefined)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Все категории</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label} ({category.count})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Город</p>
        <select
          value={filters.cityId ?? ''}
          onChange={(event) => update('cityId', event.target.value || undefined)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Все города</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Цена, ₸</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="от"
            value={filters.priceFrom ?? ''}
            onChange={(event) => update('priceFrom', event.target.value ? Number(event.target.value) : undefined)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="до"
            value={filters.priceTo ?? ''}
            onChange={(event) => update('priceTo', event.target.value ? Number(event.target.value) : undefined)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Год выпуска</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="от"
            value={filters.yearFrom ?? ''}
            onChange={(event) => update('yearFrom', event.target.value ? Number(event.target.value) : undefined)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="до"
            value={filters.yearTo ?? ''}
            onChange={(event) => update('yearTo', event.target.value ? Number(event.target.value) : undefined)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={Boolean(filters.hasMedia)}
          onChange={(event) => update('hasMedia', event.target.checked || undefined)}
          className="h-4 w-4 rounded border-slate-300"
        />
        Только с фото и видео
      </label>

      <button
        type="button"
        onClick={apply}
        className="w-full rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Применить фильтры
      </button>
    </div>
  );
}
