import "server-only"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const AUTH_COOKIE = "auth_token"

const BACKEND_URL = process.env.BACKEND_URL

if (!BACKEND_URL) {
  throw new Error("BACKEND_URL is not set")
}

const HOP_BY_HOP = new Set([
  "host",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "content-length",
  "content-encoding",
  "accept-encoding",
  "cookie",
])

function filterRequestHeaders(headers: Headers): Headers {
  const out = new Headers()
  headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) out.append(key, value)
  })
  return out
}

function filterResponseHeaders(headers: Headers): Headers {
  const out = new Headers()
  headers.forEach((value, key) => {
    const k = key.toLowerCase()
    if (k === "set-cookie") return
    if (HOP_BY_HOP.has(k)) return
    out.append(key, value)
  })
  return out
}

export async function proxyRequest(
  req: Request,
  pathSegments: string[],
): Promise<Response> {
  const jar = await cookies()
  const token = jar.get(AUTH_COOKIE)?.value

  if (!token) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 })
  }

  const incoming = new URL(req.url)
  const target = new URL(
    pathSegments.map(encodeURIComponent).join("/"),
    BACKEND_URL!.endsWith("/") ? BACKEND_URL! : `${BACKEND_URL!}/`,
  )
  target.search = incoming.search

  const headers = filterRequestHeaders(req.headers)
  headers.set("Authorization", `Bearer ${token}`)

  const hasBody = !["GET", "HEAD"].includes(req.method.toUpperCase())

  let upstream: Response
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers,
      body: hasBody ? await req.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
    })
  } catch (err) {
    return NextResponse.json(
      { error: "upstream_unreachable", detail: String(err) },
      { status: 502 },
    )
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: filterResponseHeaders(upstream.headers),
  })
}
