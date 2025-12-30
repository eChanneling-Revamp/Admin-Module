"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Search, RefreshCw, ChevronLeft, ChevronRight, Eye, AlertTriangle, XCircle, Loader2, RotateCcw } from "lucide-react"
import { adminPaymentService, Transaction } from "@/lib/adminPaymentService"
import { useToast } from "@/hooks/use-toast"

export default function FailedPaymentsPage() {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [stats, setStats] = useState({ today: 0, week: 0, totalAmount: 0 })
  const limit = 10

  const fetchFailedTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage,
        limit,
        status: 'FAILED',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }

      if (searchTerm) params.searchTerm = searchTerm

      const response = await adminPaymentService.searchTransactions(params)
      setTransactions(response.data)
      setTotalPages(response.pagination.totalPages)
      setTotalRecords(response.pagination.total)

      // Calculate stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)

      const todayCount = response.data.filter(t => new Date(t.createdAt) >= today).length
      const totalAmt = response.data.reduce((sum, t) => sum + Number(t.amount), 0)

      setStats({
        today: todayCount,
        week: response.pagination.total,
        totalAmount: totalAmt
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch failed transactions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, toast])

  useEffect(() => {
    fetchFailedTransactions()
  }, [fetchFailedTransactions])

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  const getFailureReason = (transaction: Transaction) => {
    if (transaction.gatewayResponse) {
      const response = transaction.gatewayResponse as any
      return response.error || response.message || response.failureReason || 'Unknown error'
    }
    return 'Payment gateway error'
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Failed Payments</h1>
            <p className="text-gray-600 mt-1">Monitor and resolve payment failures</p>
          </div>
          <Button variant="outline" onClick={fetchFailedTransactions}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Failed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="w-8 h-8 text-red-600" />
                <div className="text-3xl font-bold text-red-600">{stats.today}</div>
              </div>
              <p className="text-xs text-red-700 mt-1">Requires immediate attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.week}</div>
              <p className="text-xs text-gray-600 mt-1">Last 7 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Failed Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalAmount)}</div>
              <p className="text-xs text-gray-600 mt-1">Revenue at risk</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Recovery Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">--</div>
              <p className="text-xs text-gray-600 mt-1">Successfully retried</p>
            </CardContent>
          </Card>
        </div>

        {/* Failed Transactions Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Failed Transactions
                </CardTitle>
                <CardDescription>{totalRecords} failed payments requiring attention</CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search by ID or email..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <XCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">No failed payments found</p>
                <p className="text-gray-400 text-sm mt-1">All payments are processing successfully!</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Appointment</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Failure Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id} className="bg-red-50/30">
                        <TableCell className="font-mono text-sm">
                          {transaction.transactionId || transaction.id.slice(0, 12)}...
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{transaction.appointment?.appointmentNumber || '-'}</div>
                          <div className="text-xs text-gray-500">{transaction.appointment?.bookedBy?.email || '-'}</div>
                        </TableCell>
                        <TableCell className="font-semibold text-red-600">
                          {formatCurrency(Number(transaction.amount))}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getMethodLabel(transaction.paymentMethod)}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <span className="text-sm text-red-600 truncate block">
                            {getFailureReason(transaction)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedTransaction(transaction)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-blue-600">
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalRecords)} of {totalRecords}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Transaction Detail Dialog */}
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                Failed Payment Details
              </DialogTitle>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-6">
                {/* Error Banner */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Payment Failed</p>
                      <p className="text-sm text-red-600 mt-1">{getFailureReason(selectedTransaction)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Transaction Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500 text-xs uppercase">Transaction ID</Label>
                    <p className="font-mono text-sm mt-1">{selectedTransaction.transactionId || selectedTransaction.id}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-xs uppercase">Amount</Label>
                    <p className="text-xl font-bold text-red-600 mt-1">{formatCurrency(Number(selectedTransaction.amount))}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-xs uppercase">Payment Method</Label>
                    <p className="mt-1">{getMethodLabel(selectedTransaction.paymentMethod)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-xs uppercase">Currency</Label>
                    <p className="mt-1">{selectedTransaction.currency}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-xs uppercase">Attempted At</Label>
                    <p className="mt-1">{formatDate(selectedTransaction.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-xs uppercase">Status</Label>
                    <Badge variant="destructive" className="mt-1">FAILED</Badge>
                  </div>
                </div>

                <Separator />

                {/* Appointment Info */}
                {selectedTransaction.appointment && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Appointment Details</h4>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                      <div>
                        <Label className="text-gray-500 text-xs uppercase">Appointment #</Label>
                        <p className="mt-1">{selectedTransaction.appointment.appointmentNumber}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500 text-xs uppercase">Booked By</Label>
                        <p className="mt-1">{selectedTransaction.appointment.bookedBy?.name || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gateway Response */}
                {selectedTransaction.gatewayResponse && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Gateway Response</h4>
                    <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-auto max-h-40">
                      {JSON.stringify(selectedTransaction.gatewayResponse, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retry Payment
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Contact Customer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
