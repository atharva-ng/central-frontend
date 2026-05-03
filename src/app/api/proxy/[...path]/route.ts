import { proxyRequest } from "@/lib/api/proxy"

type Ctx = { params: Promise<{ path: string[] }> }

async function handle(req: Request, ctx: Ctx): Promise<Response> {
  const { path } = await ctx.params
  return proxyRequest(req, path ?? [])
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
export const HEAD = handle
export const OPTIONS = handle
