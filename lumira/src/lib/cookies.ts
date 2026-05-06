export interface CookieOptions {
  path?: string;
  expires?: Date;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) return decodeURIComponent(cookieValue);
  }
  return null;
}

export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof window === 'undefined') return;
  const { path = '/', expires, maxAge, domain, secure, sameSite = 'lax' } = options;
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  if (path) cookieString += `; path=${path}`;
  if (expires) cookieString += `; expires=${expires.toUTCString()}`;
  if (maxAge !== undefined) cookieString += `; max-age=${maxAge}`;
  if (domain) cookieString += `; domain=${domain}`;
  if (secure) cookieString += '; secure';
  if (sameSite) cookieString += `; samesite=${sameSite}`;
  document.cookie = cookieString;
}

export function deleteCookie(name: string, path = '/'): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export const AUTH_COOKIES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;
