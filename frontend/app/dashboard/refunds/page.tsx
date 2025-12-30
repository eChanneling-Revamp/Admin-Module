"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, RefreshCw, ChevronLeft, ChevronRight, Check, X, Loader2, Plus, Eye } from "lucide-react"
import { adminPaymentService, RefundRequest, RefundStatus, RefundType } from "@/lib/adminPaymentService"
import { useToast } from "@/hooks/use-toast"

export default function RefundsPage() {
  const { toast } = useToast()
  const [refunds, setRefunds] = useState<RefundRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const limit = 10

  // Statistics
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    completed: 0,
    totalAmount: 0
  })

  const fetchRefunds = useCallback(async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage,
        limit,
      }

      if (statusFilter !== "all") params.status = statusFilter as RefundStatus

      const response = await adminPaymentService.getRefundRequests(params)
      setRefunds(response.data)
      setTotalPages(response.pagination.totalPages)
      setTotalRecords(response.pagination.total)

      // Calculate stats from response
      const pendingCount = response.data.filter(r => ['REQUESTED', 'PENDING_APPROVAL'].includes(r.status)).length
      const approvedCount = response.data.filter(r => r.status === 'APPROVED').length
      const completedCount = response.data.filter(r => r.status === 'COMPLETED').length
      const totalAmt = response.data.reduce((sum, r) => sum + Number(r.refundAmount), 0)

      setStats({
        pending: pendingCount,
        approved: approvedCount,
        completed: completedCount,
        totalAmount: totalAmt
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch refund requests",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, statusFilter, toast])

  useEffect(() => {
    fetchRefunds()
  }, [fetchRefunds])

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(true)
      await adminPaymentService.approveRefund(id)
      toast({
        title: "Success",
        description: "Refund request approved successfully",
      })
      fetchRefunds()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve refund",
        variant: "destructive"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive"
      })
      return
    }
    try {
      setActionLoading(true)
      await adminPaymentService.rejectRefund(id, rejectionReason)
      toast({
        title: "Success",
        description: "Refund request rejected",
      })
      setRejectionReason("")
      setSelectedRefund(null)
      fetchRefunds()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject refund",
        variant: "destructive"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleProcess = async (id: string) => {
    try {
      setActionLoading(true)
      await adminPaymentService.processRefund(id)
      toast({
        title: "Success",
        description: "Refund processed successfully",
      })
      fetchRefunds()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process refund",
        variant: "destructive"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'COMPLETED': return 'default'
      case 'APPROVED': 
      case 'PROCESSING': return 'secondary'
      case 'REQUESTED':
      case 'PENDING_APPROVAL': return 'outline'
      case 'REJECTED':
      case 'FAILED':
      case 'CANCELLED': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Refund Management</h1>
            <p className="text-gray-600 mt-1">Process and track refund requests</p>
          </div>
          <Button variant="outline" onClick={fetchRefunds}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Refunds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
              <p className="text-xs text-gray-600 mt-1">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.approved}</div>
              <p className="text-xs text-gray-600 mt-1">Ready to process</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-gray-600 mt-1">Successfully processed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
              <p className="text-xs text-gray-600 mt-1">This page</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Refund Requests</CardTitle>
                <CardDescription>{totalRecords} total requests</CardDescription>
              </div>
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="REQUESTED">Requested</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : refunds.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No refund requests found</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request #</TableHead>
                      <TableHead>Original Amount</TableHead>
                      <TableHead>Refund Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {refunds.map((refund) => (
                      <TableRow key={refund.id}>
                        <TableCell className="font-mono text-sm">{refund.requestNumber}</TableCell>
                        <TableCell>{formatCurrency(Number(refund.originalAmount))}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(Number(refund.refundAmount))}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{refund.refundType}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{refund.requestedByEmail}</TableCell>
                        <TableCell className="text-sm text-gray-600">{formatDate(refund.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(refund.status)}>{refund.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="outline" size="sm" onClick={() => setSelectedRefund(refund)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            {['REQUESTED', 'PENDING_APPROVAL'].includes(refund.status) && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-green-600"
                                  onClick={() => handleApprove(refund.id)}
                                  disabled={actionLoading}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="text-red-600">
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Reject Refund Request</DialogTitle>
                                      <DialogDescription>
                                        Please provide a reason for rejecting this refund request.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <Label htmlFor="reason">Rejection Reason</Label>
                                      <Textarea 
                                        id="reason" 
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Enter rejection reason..."
                                        className="mt-2"
                                      />
                                    </div>
                                    <DialogFooter>
                                      <Button 
                                        variant="destructive" 
                                        onClick={() => handleReject(refund.id)}
                                        disabled={actionLoading}
                                      >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Reject Refund
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}
                            {refund.status === 'APPROVED' && (
                              <Button 
                                size="sm" 
                                onClick={() => handleProcess(refund.id)}
                                disabled={actionLoading}
                              >
                                Process
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

        {/* Refund Detail Dialog */}
        <Dialog open={!!selectedRefund} onOpenChange={() => setSelectedRefund(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Refund Details - {selectedRefund?.requestNumber}</DialogTitle>
            </DialogHeader>
            {selectedRefund && (
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <Label className="text-gray-500">Original Amount</Label>
                  <p className="font-medium">{formatCurrency(Number(selectedRefund.originalAmount))}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Refund Amount</Label>
                  <p className="font-medium">{formatCurrency(Number(selectedRefund.refundAmount))}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Refund Type</Label>
                  <p className="font-medium">{selectedRefund.refundType}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Refund Method</Label>
                  <p className="font-medium">{selectedRefund.refundMethod}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <Badge variant={getStatusVariant(selectedRefund.status)}>{selectedRefund.status}</Badge>
                </div>
                <div>
                  <Label className="text-gray-500">Payment ID</Label>
                  <p className="font-mono text-sm">{selectedRefund.paymentId}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-500">Reason</Label>
                  <p className="font-medium">{selectedRefund.reason}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Requested By</Label>
                  <p className="font-medium">{selectedRefund.requestedByEmail}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Requested At</Label>
                  <p className="font-medium">{formatDate(selectedRefund.createdAt)}</p>
                </div>
                {selectedRefund.approvedByEmail && (
                  <>
                    <div>
                      <Label className="text-gray-500">Approved By</Label>
                      <p className="font-medium">{selectedRefund.approvedByEmail}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Approved At</Label>
                      <p className="font-medium">{selectedRefund.approvedAt ? formatDate(selectedRefund.approvedAt) : '-'}</p>
                    </div>
                  </>
                )}
                {selectedRefund.rejectionReason && (
                  <div className="col-span-2">
                    <Label className="text-gray-500">Rejection Reason</Label>
                    <p className="font-medium text-red-600">{selectedRefund.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
