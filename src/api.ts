const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';
const TOKEN_KEY = 'secure-notes-token';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: { path: string; message: string }[],
  ) {
    super(message);
  }
}

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

type Query = Record<string, string | number | undefined>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Query;
}

let unauthorizedHandler: (() => void) | undefined;
export const setUnauthorizedHandler = (fn: () => void) => {
  unauthorizedHandler = fn;
};

export async function request<T>(
  path: string,
  { method = 'GET', body, query }: RequestOptions = {},
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(query ?? {}).forEach(
    ([k, v]) => v !== undefined && v !== '' && url.searchParams.set(k, String(v)),
  );

  const token = tokenStore.get();
  const res = await fetch(url, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    // expired token or deleted account, so drop the session
    if (res.status === 401 && token && !path.startsWith('/auth/login')) unauthorizedHandler?.();
    throw new ApiError(res.status, json?.error?.message ?? 'Request failed', json?.error?.details);
  }
  return json as T;
}
