import { API_BASE_URL, API_TIMEOUT } from './config';

type Primitive = string | number | boolean | null | undefined;

export interface ApiFetchOptions extends RequestInit {
  searchParams?: Record<string, Primitive | Primitive[]>;
  skipAuth?: boolean;
}

function buildQuery(params?: Record<string, Primitive | Primitive[]>) {
  if (!params) return '';
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.filter((item) => item != null && item !== '').forEach((item) => query.append(key, String(item)));
    } else if (value != null && value !== '') {
      query.append(key, String(value));
    }
  }
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export async function apiFetch<T>(path: string, { searchParams, headers, body, method = 'GET', skipAuth, ...rest }: ApiFetchOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);
  const url = `${API_BASE_URL}${path}${buildQuery(searchParams)}`;
  const finalHeaders = new Headers(headers);

  if (body && !(body instanceof FormData)) {
    if (!finalHeaders.has('Content-Type')) {
      finalHeaders.set('Content-Type', 'application/json');
    }
    body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, {
      method,
      body: body as BodyInit | null | undefined,
      credentials: skipAuth ? 'same-origin' : 'include',
      headers: finalHeaders,
      signal: controller.signal,
      ...rest
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(errorText || `API error ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return (await response.json()) as T;
    }
    return (await response.text()) as unknown as T;
  } finally {
    clearTimeout(timeout);
  }
}
