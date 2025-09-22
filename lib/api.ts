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

export async function getBrowseData(params?: {
  category?: string;
  sort?: string;
  page?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);
  if (params?.sort) qs.set('sort', params.sort);
  if (typeof params?.page === 'number') qs.set('page', String(params.page));

  const url = `${API_BASE}/browse${qs.toString() ? `?${qs.toString()}` : ''}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`getBrowseData failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
