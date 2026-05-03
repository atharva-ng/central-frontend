const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set")
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message)
  }
}

export class NetworkError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
  }
}

export type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown
}

export type RetryOptions = {
  retries?: number
  backoffMs?: number
}

export async function request<T>(
  path: string,
  token: string | null,
  options: FetchOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (err) {
    throw new NetworkError(`${rest.method ?? "GET"} ${path} failed`, err)
  }

  const text = await res.text()
  const parsed = text ? safeJson(text) : undefined

  if (!res.ok) {
    throw new ApiError(res.status, `${rest.method ?? "GET"} ${path} failed`, parsed)
  }

  return parsed as T
}

/**
 * Opt-in retry wrapper. Only retries on 5xx and network errors.
 * Never retries 4xx — those are results, not failures.
 *
 * Default zero retries: callers must explicitly opt in. Don't apply this to
 * non-idempotent calls (POST/PATCH/DELETE) unless you've thought about it.
 */
export async function requestWithRetry<T>(
  path: string,
  token: string | null,
  options: FetchOptions = {},
  retry: RetryOptions = {},
): Promise<T> {
  const retries = retry.retries ?? 0
  const backoffMs = retry.backoffMs ?? 200

  let attempt = 0
  while (true) {
    try {
      return await request<T>(path, token, options)
    } catch (err) {
      const retriable =
        err instanceof NetworkError ||
        (err instanceof ApiError && err.status >= 500)
      if (!retriable || attempt >= retries) throw err
      attempt++
      await sleep(backoffMs * attempt)
    }
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
