export type ApiResponse<T = unknown> = {
  ok: boolean;
  data?: T;
  error?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

export async function fetchApi<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
      ...init,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: (json as any)?.message || res.statusText };
    }
    return { ok: true, data: json as T };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Network error' };
  }
}

export function postApi<T = unknown>(path: string, body?: any) {
  return fetchApi<T>(path, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
