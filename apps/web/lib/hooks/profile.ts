import { useQuery } from '@tanstack/react-query';
import type { DashboardOverview, UserProfile } from '../../types';
import { apiFetch } from '../api-client';
import type { ApiFetchOptions } from '../api-client';

export const profileKeys = {
  base: ['profile'] as const,
  overview: () => [...profileKeys.base, 'overview'] as const
};

export function fetchCurrentUser(options?: ApiFetchOptions) {
  return apiFetch<UserProfile>('/users/me', options);
}

export function useCurrentUser() {
  return useQuery({
    queryKey: profileKeys.base,
    queryFn: fetchCurrentUser
  });
}

export function fetchDashboardOverview(options?: ApiFetchOptions) {
  return apiFetch<DashboardOverview>('/profile/overview', options);
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: profileKeys.overview(),
    queryFn: fetchDashboardOverview
  });
}
