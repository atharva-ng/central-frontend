import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { AUTH_COOKIE } from "@/lib/api/proxy"

type Body = { token?: unknown }

export async function POST(req: Request): Promise<Response> {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const token = typeof body.token === "string" ? body.token.trim() : ""
  if (!token) {
    return NextResponse.json({ error: "missing_token" }, { status: 400 })
  }

  const jar = await cookies()
  jar.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(): Promise<Response> {
  const jar = await cookies()
  jar.delete(AUTH_COOKIE)
  return NextResponse.json({ ok: true })
}
