export async function syncAuthToken(token: string): Promise<void> {
  const res = await fetch("/api/auth/set-token", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  })
  if (!res.ok) {
    throw new Error(`failed to sync auth token: ${res.status}`)
  }
}

export async function clearAuthToken(): Promise<void> {
  await fetch("/api/auth/set-token", {
    method: "DELETE",
    credentials: "include",
  })
}
