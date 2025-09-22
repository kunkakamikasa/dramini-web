export type ApiResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  message?: string;
} & Record<string, any>;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

export async function fetchApi<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<ApiResult<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    cache: 'no-store',
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {}

  return {
    ok: res.ok,
    status: res.status,
    data: (json ?? null) as T | null,
    ...(typeof json === 'object' && json ? json : {}),
  };
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
