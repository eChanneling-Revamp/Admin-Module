"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, RefreshCw, FileText } from "lucide-react"
import { paymentApi, type PaymentStatistics, type Transaction } from "@/lib/api/paymentApi"

const REPORT_REFRESH_INTERVAL_MS = 60_000

const formatCurrency = (amount: number) =>
  `LKR ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

const getStatusVariant = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "default" as const
    case "FAILED":
    case "CANCELLED":
      return "destructive" as const
    case "REFUNDED":
      return "outline" as const
    default:
      return "secondary" as const
  }
}

const getMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    CREDIT_CARD: "Credit Card",
    DEBIT_CARD: "Debit Card",
    BANK_TRANSFER: "Bank Transfer",
    CASH: "Cash",
    MOBILE_PAYMENT: "Mobile Payment",
    OTHER: "Other",
  }

  return labels[method] || method
}

export default function FinancialReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const loadFinancialData = useCallback(async (forceRefresh = false, silent = false) => {
    try {
      if (silent) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError(null)

      const [paymentsResponse, statisticsResponse] = await Promise.all([
        paymentApi.getPayments(
          {
            page: 1,
            limit: 1000,
            sortBy: "createdAt",
            sortOrder: "desc",
          },
          { forceRefresh }
        ),
        paymentApi.getPaymentStatistics({ forceRefresh }),
      ])

      setTransactions(paymentsResponse.data)
      setStatistics(statisticsResponse.data)
      setLastUpdated(new Date().toISOString())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load financial report data")
      setTransactions([])
      setStatistics(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadFinancialData()

    const intervalId = window.setInterval(() => {
      loadFinancialData(true, true)
    }, REPORT_REFRESH_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [loadFinancialData])

  const monthlyBreakdown = useMemo(() => {
    const monthlyMap = new Map<
      string,
      {
        label: string
        total: number
        completed: number
        pending: number
        refunded: number
      }
    >()

    transactions.forEach((transaction) => {
      const date = new Date(transaction.createdAt)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      const label = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      const existing = monthlyMap.get(monthKey) || {
        label,
        total: 0,
        completed: 0,
        pending: 0,
        refunded: 0,
      }

      existing.total += transaction.amount

      if (transaction.status === "COMPLETED") {
        existing.completed += transaction.amount
      }

      if (transaction.status === "PENDING" || transaction.status === "UNPAID") {
        existing.pending += transaction.amount
      }

      if (transaction.status === "REFUNDED") {
        existing.refunded += transaction.amount
      }

      monthlyMap.set(monthKey, existing)
    })

    return Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, value]) => value)
  }, [transactions])

  const paymentMethodBreakdown = useMemo(() => {
    const byMethod = statistics?.byMethod || {}
    const totalAmount = statistics?.totalAmount || 0

    return Object.entries(byMethod)
      .map(([method, values]) => ({
        method,
        label: getMethodLabel(method),
        count: values.count,
        amount: values.amount,
        percentage: totalAmount > 0 ? Math.round((values.amount / totalAmount) * 100) : 0,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.amount - a.amount)
  }, [statistics])

  const recentTransactions = useMemo(() => transactions.slice(0, 8), [transactions])

  const monthlyRevenue = monthlyBreakdown[monthlyBreakdown.length - 1]?.completed || 0
  const completedRevenue = statistics?.completedAmount || 0
  const pendingRevenue = statistics?.pendingAmount || 0
  const refundedRevenue = statistics?.refundedAmount || 0
  const totalTransactions = statistics?.totalTransactions || 0
  const averageTransaction = totalTransactions > 0 ? (statistics?.totalAmount || 0) / totalTransactions : 0

  const handleRefresh = async () => {
    await loadFinancialData(true, true)
  }

  const handleExport = async () => {
    try {
      const response = await paymentApi.getPayments(
        {
          page: 1,
          limit: 100_000,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
        { forceRefresh: true }
      )

      const csv = paymentApi.generateCsv(response.data)
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `financial-report-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export financial report data")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600 mt-1">Live revenue and transaction analytics from the existing payment data flow</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Live Data
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 text-sm text-red-700">
              {error}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</div>
              <p className="text-xs text-gray-600 mt-1">Completed revenue in the latest live month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Completed Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(completedRevenue)}</div>
              <p className="text-xs text-gray-600 mt-1">Collected from completed transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{formatCurrency(pendingRevenue)}</div>
              <p className="text-xs text-gray-600 mt-1">Pending and unpaid transaction value</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(averageTransaction)}</div>
              <p className="text-xs text-gray-600 mt-1">{totalTransactions.toLocaleString()} live transactions analyzed</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown by Payment Method</CardTitle>
              <CardDescription>Live mix of value already coming through the existing payment flow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethodBreakdown.length > 0 ? (
                  paymentMethodBreakdown.map((item) => (
                    <div key={item.method} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-gray-600">
                          {formatCurrency(item.amount)} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                      </div>
                      <p className="text-xs text-gray-500">{item.count.toLocaleString()} transactions</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No payment method data available.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
              <CardDescription>Completed, pending, and refunded values from recent live months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyBreakdown.length > 0 ? (
                  monthlyBreakdown.map((month) => (
                    <div key={month.label} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{month.label}</p>
                        <p className="text-sm text-gray-500">Total {formatCurrency(month.total)}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="rounded-md bg-green-50 p-3">
                          <p className="text-gray-500">Completed</p>
                          <p className="font-semibold text-green-700">{formatCurrency(month.completed)}</p>
                        </div>
                        <div className="rounded-md bg-amber-50 p-3">
                          <p className="text-gray-500">Pending</p>
                          <p className="font-semibold text-amber-700">{formatCurrency(month.pending)}</p>
                        </div>
                        <div className="rounded-md bg-slate-50 p-3">
                          <p className="text-gray-500">Refunded</p>
                          <p className="font-semibold text-slate-700">{formatCurrency(month.refunded)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No monthly payment trend data available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Financial Activity</CardTitle>
            <CardDescription>
              Latest live transactions already used by the existing payments workflow
              {lastUpdated ? ` - Updated ${formatDateTime(lastUpdated)}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span>{transaction.transactionId || transaction.id.slice(0, 12)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.bookingId || transaction.appointment?.appointmentNumber || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getMethodLabel(transaction.paymentMethod)}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(transaction.status)}>
                          {transaction.sourceStatus || transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{formatDateTime(transaction.createdAt)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No live financial activity found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Refund Exposure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-700">{formatCurrency(refundedRevenue)}</div>
              <p className="text-xs text-gray-600 mt-1">Value currently marked refunded</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Completed Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(statistics?.byStatus?.COMPLETED?.count || 0).toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-1">Successfully settled payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Failed Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {(statistics?.byStatus?.FAILED?.count || 0).toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-1">Transactions needing follow-up</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
