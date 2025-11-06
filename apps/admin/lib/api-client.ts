import { isAbsoluteUrl } from './url';
import { API_BASE_URL } from './config';

interface ApiRequestOptions extends RequestInit {
  searchParams?: Record<string, string | number | boolean | undefined | null>;
  parseJson?: boolean;
}

function buildUrl(path: string, searchParams?: ApiRequestOptions['searchParams']): string {
  const base = isAbsoluteUrl(path) ? path : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  if (!searchParams) {
    return base;
  }

  const url = new URL(base);
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { searchParams, parseJson = true, headers, ...rest } = options;
  const url = buildUrl(path, searchParams);

  const requestHeaders: HeadersInit = {
    Accept: 'application/json',
    ...headers,
  };

  if (rest.body && !(rest.body instanceof FormData)) {
    requestHeaders['Content-Type'] = requestHeaders['Content-Type'] ?? 'application/json';
  }

  const init: RequestInit = {
    method: rest.method ?? 'GET',
    ...rest,
    headers: requestHeaders,
    cache: 'no-store',
  };

  if (typeof window === 'undefined') {
    const { getSessionCookieHeader } = await import('./server-cookie');
    const cookieHeader = getSessionCookieHeader();
    if (cookieHeader) {
      (init.headers as HeadersInit)['cookie'] = cookieHeader;
    }
  } else {
    init.credentials = 'include';
  }

  const response = await fetch(url, init);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API request failed with status ${response.status}`);
  }

  if (!parseJson || response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
