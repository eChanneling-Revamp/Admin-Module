"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { paymentApi, PayHereIntegrationStatus, HealthProbeResult } from "@/lib/api/paymentApi"
import { Activity, AlertTriangle, CheckCircle2, Clock3, RefreshCw, ShieldCheck } from "lucide-react"

const formatDateTime = (value?: string) => {
  if (!value) return "-"

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

const formatUptime = (seconds?: number) => {
  if (typeof seconds !== "number" || !Number.isFinite(seconds)) {
    return "-"
  }

  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

const formatLatency = (latencyMs: number | null) => {
  if (latencyMs === null) return "-"
  return `${latencyMs} ms`
}

function EndpointHealthCard({ label, probe }: { label: string; probe: HealthProbeResult }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-3">
          <div>
            <CardTitle className="text-base">{label}</CardTitle>
            <CardDescription className="mt-1 font-mono text-xs">{probe.endpoint}</CardDescription>
          </div>
          <Badge variant={probe.ok ? "default" : "destructive"}>
            {probe.ok ? "Reachable" : "Issue"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Status:</span>
          <span className="font-medium">{probe.data?.status || "-"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Timestamp:</span>
          <span className="font-medium">{formatDateTime(probe.data?.timestamp)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Uptime:</span>
          <span className="font-medium">{formatUptime(probe.data?.uptime)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Latency:</span>
          <span className="font-medium">{formatLatency(probe.latencyMs)}</span>
        </div>
        {probe.error && <p className="text-sm text-red-600">{probe.error}</p>}
      </CardContent>
    </Card>
  )
}

export default function PaymentGatewaysPage() {
  const { toast } = useToast()
  const [integrationStatus, setIntegrationStatus] = useState<PayHereIntegrationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const runPayHereCheck = useCallback(async (manual = false) => {
    try {
      if (manual) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const result = await paymentApi.checkPayHereIntegration()
      setIntegrationStatus(result)
    } catch (error: any) {
      toast({
        title: "Health Check Failed",
        description: error.message || "Unable to run PayHere integration checks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [toast])

  useEffect(() => {
    runPayHereCheck()
  }, [runPayHereCheck])

  const isConnected = integrationStatus?.connected || false
  const liveStatus = integrationStatus?.live.data?.status || "-"
  const healthStatus = integrationStatus?.health.data?.status || "-"
  const serviceVersion = integrationStatus?.health.data?.version || "-"

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Payment Gateway Integrations</h1>
            <p className="text-gray-600 mt-1">Live integration checks for payment providers</p>
          </div>
          <Button
            variant="outline"
            onClick={() => runPayHereCheck(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(loading || refreshing) ? "animate-spin" : ""}`} />
            Re-check PayHere
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Gateway Status</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${isConnected ? "text-green-600" : "text-red-600"}`}>
                {isConnected ? "Connected" : "Issue"}
              </div>
              {isConnected ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Live Probe</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-2xl font-bold">{liveStatus}</div>
              <Activity className="w-6 h-6 text-blue-600" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Service Health</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-2xl font-bold">{healthStatus}</div>
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Service Version</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-2xl font-bold">{serviceVersion}</div>
              <Clock3 className="w-6 h-6 text-gray-600" />
            </CardContent>
          </Card>
        </div>

        {loading && !integrationStatus ? (
          <Card>
            <CardContent className="py-10 flex justify-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </CardContent>
          </Card>
        ) : integrationStatus ? (
          <>
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <CardTitle>PayHere Integration Summary</CardTitle>
                    <CardDescription className="mt-1">
                      Last checked: {formatDateTime(integrationStatus.checkedAt)}
                    </CardDescription>
                  </div>
                  <Badge variant={integrationStatus.connected ? "default" : "destructive"}>
                    {integrationStatus.connected ? "Healthy" : "Needs Attention"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-sm ${integrationStatus.connected ? "text-green-700" : "text-red-700"}`}>
                  {integrationStatus.message}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EndpointHealthCard label="Live Endpoint" probe={integrationStatus.live} />
              <EndpointHealthCard label="Service Endpoint" probe={integrationStatus.health} />
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-gray-600">
              No integration data yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
