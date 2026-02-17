"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, RefreshCw, ChevronLeft, ChevronRight, Eye, RotateCcw, CreditCard, Loader2 } from "lucide-react"
import { adminPaymentService, Transaction, PaymentStatistics, PaymentStatus, PaymentMethod } from "@/lib/adminPaymentService"
import { useToast } from "@/hooks/use-toast"

export default function PaymentsPage() {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const limit = 10

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }

      if (searchTerm) params.searchTerm = searchTerm
      if (statusFilter !== "all") params.status = statusFilter as PaymentStatus
      if (methodFilter !== "all") params.paymentMethod = methodFilter as PaymentMethod

      const response = await adminPaymentService.searchTransactions(params)
      setTransactions(response.data)
      setTotalPages(response.pagination.totalPages)
      setTotalRecords(response.pagination.total)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch transactions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, statusFilter, methodFilter, toast])

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await adminPaymentService.getPaymentStatistics()
      setStatistics(response.data)
    } catch (error: any) {
      console.error("Failed to fetch statistics:", error)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
    fetchStatistics()
  }, [fetchTransactions, fetchStatistics])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchTransactions()
  }

  const handleExport = async () => {
    try {
      const today = new Date()
      const startDate = new Date(today.setMonth(today.getMonth() - 1)).toISOString()
      const endDate = new Date().toISOString()
      
      await adminPaymentService.generateReport({
        reportType: 'CUSTOM_RANGE',
        startDate,
        endDate,
        format: 'CSV'
      })
      
      toast({
        title: "Export Started",
        description: "Your report is being generated",
      })
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export transactions",
        variant: "destructive"
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'default'
      case 'PENDING': return 'secondary'
      case 'FAILED': return 'destructive'
      case 'REFUNDED': return 'outline'
      case 'CANCELLED': return 'destructive'
      default: return 'secondary'
    }
  }

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      'CREDIT_CARD': 'Credit Card',
      'DEBIT_CARD': 'Debit Card',
      'BANK_TRANSFER': 'Bank Transfer',
      'CASH': 'Cash',
      'MOBILE_PAYMENT': 'Mobile Payment'
    }
    return labels[method] || method
  }

  // Calculate statistics
  const completedCount = statistics?.byStatus?.COMPLETED?.count || 0
  const totalCount = statistics?.totalTransactions || 0
  const successRate = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : '0'
  const failedCount = statistics?.byStatus?.FAILED?.count || 0
  const avgTransaction = totalCount > 0 ? (statistics?.totalAmount || 0) / totalCount : 0

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Transactions</h1>
            <p className="text-gray-600 mt-1">Monitor all payment activities and transactions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { fetchTransactions(); fetchStatistics(); }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(statistics?.completedAmount || 0)}</div>
              <p className="text-xs text-gray-600 mt-1">Completed payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCount.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{successRate}%</div>
              <p className="text-xs text-gray-600 mt-1">{completedCount.toLocaleString()} successful</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{failedCount}</div>
              <p className="text-xs text-gray-600 mt-1">Need attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(avgTransaction)}</div>
              <p className="text-xs text-gray-600 mt-1">Per booking</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest payment activities across the platform ({totalRecords} total)</CardDescription>
              </div>
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Search transactions..." 
                    className="pl-10 w-full md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </form>
                <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={methodFilter} onValueChange={(value) => { setMethodFilter(value); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="MOBILE_PAYMENT">Mobile Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No transactions found</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Appointment</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">
                          {payment.transactionId || payment.id.slice(0, 12)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {payment.appointment?.appointmentNumber || '-'}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(Number(payment.amount))}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getMethodLabel(payment.paymentMethod)}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(payment.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(payment.status)}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {payment.status === 'COMPLETED' && (
                              <Button variant="outline" size="sm" title="Initiate Refund">
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalRecords)} of {totalRecords} results
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
