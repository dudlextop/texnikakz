import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ListingDetail, ListingFilters, ListingsApiResponse } from '../../types';
import { apiFetch } from '../api-client';
import type { ApiFetchOptions } from '../api-client';

export const listingKeys = {
  all: ['listings'] as const,
  list: (filters: ListingFilters) => [...listingKeys.all, { ...filters }] as const,
  detail: (id: string) => [...listingKeys.all, 'detail', id] as const
};

export function fetchListings(filters: ListingFilters, options?: ApiFetchOptions) {
  return apiFetch<ListingsApiResponse>('/listings', {
    searchParams: filters,
    ...options
  });
}

export function useListingsQuery(filters: ListingFilters) {
  return useQuery({
    queryKey: listingKeys.list(filters),
    queryFn: () => fetchListings(filters)
  });
}

export function fetchListingDetail(id: string, options?: ApiFetchOptions) {
  return apiFetch<ListingDetail>(`/listings/${id}`, options);
}

export function useListingDetail(id: string | undefined) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: id ? listingKeys.detail(id) : listingKeys.all,
    queryFn: () => fetchListingDetail(id as string)
  });
}

export function useListingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id?: string; payload: unknown; method: 'POST' | 'PUT' }) => {
      if (input.id) {
        return apiFetch<ListingDetail>(`/listings/${input.id}`, {
          method: input.method,
          body: input.payload
        });
      }
      return apiFetch<ListingDetail>('/listings', {
        method: input.method,
        body: input.payload
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: listingKeys.detail(variables.id) });
      }
    }
  });
}
