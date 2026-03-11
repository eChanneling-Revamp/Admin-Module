import { NextRequest, NextResponse } from "next/server"
import https from "node:https"

const PAYMENT_API_ORIGIN = "https://dpdlab1.slt.lk:8645"

const agent = new https.Agent({
  rejectUnauthorized: false,
})

const buildUpstreamUrl = (pathname: string, search: string) => {
  const url = new URL(pathname, PAYMENT_API_ORIGIN)
  url.search = search
  return url
}

export async function proxyPaymentRequest(request: NextRequest, pathname: string) {
  const upstreamUrl = buildUpstreamUrl(pathname, request.nextUrl.search)

  try {
    const upstreamResponse = await new Promise<{
      status: number
      contentType: string | null
      body: string
    }>((resolve, reject) => {
      const req = https.request(
        upstreamUrl,
        {
          method: "GET",
          headers: {
            Accept: request.headers.get("accept") || "application/json",
          },
          agent,
        },
        (res) => {
          const chunks: Buffer[] = []

          res.on("data", (chunk) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
          })

          res.on("end", () => {
            resolve({
              status: res.statusCode || 502,
              contentType: typeof res.headers["content-type"] === "string" ? res.headers["content-type"] : null,
              body: Buffer.concat(chunks).toString("utf8"),
            })
          })
        }
      )

      req.on("error", reject)
      req.end()
    })

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: {
        "content-type": upstreamResponse.contentType || "application/json",
        "cache-control": "no-store",
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment upstream request failed"

    return NextResponse.json(
      {
        message,
        upstream: upstreamUrl.toString(),
      },
      { status: 502 }
    )
  }
}
