# Onboarding — Begin Analysis Wiring

How the "Begin analysis" button on `/onboarding` is wired to the backend
`POST /v1/onboard` endpoint. Use this as a reference when adding the next
client-side API call so the pattern stays consistent.

## Reference curl

```bash
curl --location 'https://<api-host>/v1/onboard' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <jwt>' \
  --data '{
      "websiteUrl": "https://www.hack2hire.com/",
      "country": "India"
  }'
```

The bearer token comes from Clerk at runtime — never hardcode the JWT shown
in the curl example.

## Layering

We mirror the `getCurrentUser` pattern from
[src/lib/api/users.server.ts](src/lib/api/users.server.ts):

- A typed wrapper in `src/lib/api/<resource>.{client,server}.ts` owns the
  endpoint, request shape, and any retry/error mapping.
- Components import the wrapper from
  [src/lib/api/client.ts](src/lib/api/client.ts) (or `server.ts`) — never
  the raw `apiFetchClient`/`apiFetch` from a component.

Components stay focused on UI state; endpoint details live in one file
that's easy to grep when the backend contract changes.

## Steps to replay this wiring

1. **Register the route** in [src/lib/api/routes.ts](src/lib/api/routes.ts).
   Add a namespaced entry under `ROUTES` so every backend path is grep-able
   from one file:

   ```ts
   onboarding: {
     begin: "/v1/onboard",
   },
   ```

2. **Write a typed wrapper** in
   [src/lib/api/onboarding.client.ts](src/lib/api/onboarding.client.ts).
   This is the client-side analogue of `getCurrentUser` — it owns the
   route, payload type, and error-mapping decisions:

   ```ts
   export async function beginOnboarding(
     getToken: () => Promise<string | null>,
     payload: BeginOnboardingPayload,
   ): Promise<void> {
     await apiFetchClient(getToken, ROUTES.onboarding.begin, {
       method: "POST",
       body: payload,
     })
   }
   ```

   File suffix convention: `*.client.ts` for browser-only callers,
   `*.server.ts` (with `import "server-only"`) for Server Components and
   Route Handlers.

3. **Re-export from the barrel** in
   [src/lib/api/client.ts](src/lib/api/client.ts) so components have a
   single import surface:

   ```ts
   export { beginOnboarding } from "./onboarding.client"
   export type { BeginOnboardingPayload } from "./onboarding.client"
   ```

4. **Acquire the token via Clerk** inside the component:

   ```ts
   const { getToken } = useAuth() // from "@clerk/nextjs"
   ```

   Pass `getToken` to the wrapper — it forwards to `apiFetchClient`, which
   awaits it and adds the `Authorization: Bearer …` header.

5. **Shape the payload at the call site.** The backend expects a
   fully-qualified URL and the country **name** (e.g. `"India"`), not the
   ISO code. The form stores the ISO code from the `<Select>`; resolve it
   via `COUNTRIES.find(...)` before calling. Prepend `https://` to the
   user-typed host since the input is bare-host with a visual prefix.

6. **Handle errors at the component layer.** The wrapper lets `ApiError`
   (non-2xx, has `.status`) and `NetworkError` (request never reached the
   server) propagate so each call site can pick its own UX. Surface
   failures with `toast.error(...)` from `sonner` — the `<Toaster />` is
   already mounted in the root layout. Don't retry POST/PATCH automatically
   (the `requestWithRetry` helper exists but is opt-in for a reason —
   non-idempotent calls shouldn't auto-retry).

7. **Lock the UI while submitting.** Track `submitting` state, disable the
   inputs/button, and swap the button label to a `Loader2` spinner. On
   success, `router.push("/onboarding/analyzing")`. Leave `submitting`
   true on success so the button stays locked during the route transition;
   only reset it on error.

## Files touched

- [src/lib/api/routes.ts](src/lib/api/routes.ts) — added `ROUTES.onboarding.begin`
- [src/lib/api/onboarding.client.ts](src/lib/api/onboarding.client.ts)
  — `beginOnboarding` wrapper + `BeginOnboardingPayload` type (mirrors
  `users.server.ts`)
- [src/lib/api/client.ts](src/lib/api/client.ts) — re-exported the wrapper
  + payload type
- [src/app/onboarding/onboarding-form.tsx](src/app/onboarding/onboarding-form.tsx)
  — bound country state, `handleSubmit` calls `beginOnboarding`, wired
  loading + error UI

## Don'ts

- Don't go through `/api/proxy/[...path]` for client-originated calls. The
  proxy is cookie-based and exists for the server-rendered surface; the
  client fetcher already attaches the Clerk token directly to the
  `NEXT_PUBLIC_API_URL` host.
- Don't hardcode the API host in the component — it's already resolved
  inside `request()` from `process.env.NEXT_PUBLIC_API_URL`.
- Don't put new endpoints inline as string literals. Add them to `ROUTES`
  first so the backend surface area stays auditable.
