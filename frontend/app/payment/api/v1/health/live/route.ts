import { NextRequest } from "next/server"
import { proxyPaymentRequest } from "@/app/payment/_lib/proxy"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  return proxyPaymentRequest(request, "/payment/api/v1/health/live")
}
