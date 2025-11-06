import { cookies, headers } from 'next/headers';
import type { ApiFetchOptions } from './api-client';
import { apiFetch } from './api-client';

export async function serverApiFetch<T>(path: string, options: ApiFetchOptions = {}) {
  const cookieStore = cookies();
  const forwardedHeaders = new Headers(options.headers);
  const cookieHeader = cookieStore.toString();
  if (cookieHeader) {
    forwardedHeaders.set('cookie', cookieHeader);
  }
  const host = headers().get('host');
  if (host) {
    forwardedHeaders.set('x-forwarded-host', host);
  }
  return apiFetch<T>(path, {
    ...options,
    headers: forwardedHeaders,
    skipAuth: true
  });
}
