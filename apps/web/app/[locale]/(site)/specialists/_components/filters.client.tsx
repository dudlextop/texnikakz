'use client';

import { useRouter } from 'next/navigation';
import type { SpecialistFilters } from '../../../../types';
import { SearchBar } from '../../../../components';

function toQuery(filters: SpecialistFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === null) return;
    if (key === 'limit' || key === 'offset') return;
    params.set(key, String(value));
  });
  return params.toString();
}

interface SpecialistsFiltersClientProps {
  initialFilters: SpecialistFilters;
}

export function SpecialistsFiltersClient({ initialFilters }: SpecialistsFiltersClientProps) {
  const router = useRouter();

  return (
    <SearchBar
      placeholder="Поиск операторов"
      queryKey="q"
      key={JSON.stringify(initialFilters)}
      onSubmit={(value) => {
        const next = { ...initialFilters, q: value || undefined, offset: undefined };
        const qs = toQuery(next);
        router.push(qs ? `?${qs}` : '?');
      }}
    />
  );
}
