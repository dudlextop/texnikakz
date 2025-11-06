import { cookies } from 'next/headers';

export function getSessionCookieHeader(): string | undefined {
  const cookieStore = cookies();
  const serialized = cookieStore.getAll().map((item) => `${item.name}=${item.value}`);
  if (!serialized.length) {
    return undefined;
  }
  return serialized.join('; ');
}
