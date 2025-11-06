import { useQuery } from '@tanstack/react-query';
import type { SpecialistDetail, SpecialistFilters, SpecialistsApiResponse } from '../../types';
import { apiFetch } from '../api-client';
import type { ApiFetchOptions } from '../api-client';

export const specialistKeys = {
  all: ['specialists'] as const,
  list: (filters: SpecialistFilters) => [...specialistKeys.all, { ...filters }] as const,
  detail: (id: string) => [...specialistKeys.all, 'detail', id] as const
};

export function fetchSpecialists(filters: SpecialistFilters, options?: ApiFetchOptions) {
  return apiFetch<SpecialistsApiResponse>('/specialists', {
    searchParams: filters,
    ...options
  });
}

export function useSpecialistsQuery(filters: SpecialistFilters) {
  return useQuery({
    queryKey: specialistKeys.list(filters),
    queryFn: () => fetchSpecialists(filters)
  });
}

export function fetchSpecialistDetail(id: string, options?: ApiFetchOptions) {
  return apiFetch<SpecialistDetail>(`/specialists/${id}`, options);
}

export function useSpecialistDetail(id: string | undefined) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: id ? specialistKeys.detail(id) : specialistKeys.all,
    queryFn: () => fetchSpecialistDetail(id as string)
  });
}
