import { cache } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { API_BASE_URL } from './config';
import type { AdminUser } from './types';
import { getSessionCookieHeader } from './server-cookie';

async function fetchCurrentUser(): Promise<AdminUser | null> {
  noStore();
  const cookieHeader = getSessionCookieHeader();
  if (!cookieHeader) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    if (response.status === 401 || response.status === 403) {
      return null;
    }

    if (!response.ok) {
      console.error('Failed to load admin session user', await response.text());
      return null;
    }

    const data = (await response.json()) as AdminUser;
    return data;
  } catch (error) {
    console.error('Admin session fetch error', error);
    return null;
  }
}

export const getSessionUser = cache(fetchCurrentUser);
