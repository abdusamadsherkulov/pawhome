const API = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

type Options = { method?: string; body?: unknown; token?: string | null };

export async function apiFetch<T>(path: string, options: Options = {}): Promise<T> {
  // files are sent as FormData, everything else as JSON
  const isForm = options.body instanceof FormData;

  // auth calls go through the website itself (see next.config.ts) so the login cookie stays first-party
  const base = path.startsWith('/auth') ? '' : API;

  const res = await fetch(`${base}/api${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: {
      ...(options.body && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? (isForm ? (options.body as FormData) : JSON.stringify(options.body)) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.message ?? 'Something went wrong');
  return data as T;
}