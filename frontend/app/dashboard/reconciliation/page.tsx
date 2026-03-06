"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RefreshCw, ChevronLeft, ChevronRight, Loader2, Play, Eye, AlertTriangle, CheckCircle, Download, CreditCard } from "lucide-react"
import { adminPaymentService, Reconciliation, ReconciliationStatus } from "@/lib/adminPaymentService"
import { useToast } from "@/hooks/use-toast"

export default function ReconciliationPage() {
  const { toast } = useToast()
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [selectedRecon, setSelectedRecon] = useState<Reconciliation | null>(null)
  const [runDialogOpen, setRunDialogOpen] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [runLoading, setRunLoading] = useState(false)
  const limit = 10

  // Statistics
  const [stats, setStats] = useState({
    pendingAmount: 0,
    reconciledAmount: 0,
    discrepancies: 0
  })

  const fetchReconciliations = useCallback(async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage,
        limit,
      }

      if (statusFilter !== "all") params.status = statusFilter as ReconciliationStatus

      const response = await adminPaymentService.getReconciliations(params)
      setReconciliations(response.data)
      setTotalPages(response.pagination.totalPages)
      setTotalRecords(response.pagination.total)

      // Calculate stats
      const pending = response.data.filter(r => r.status === 'IN_PROGRESS').reduce((sum, r) => sum + Number(r.totalAmount), 0)
      const reconciled = response.data.filter(r => r.status === 'COMPLETED').reduce((sum, r) => sum + Number(r.matchedAmount), 0)
      const discrepancyCount = response.data.reduce((sum, r) => sum + r.mismatchedTransactions, 0)

      setStats({
        pendingAmount: pending,
        reconciledAmount: reconciled,
        discrepancies: discrepancyCount
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch reconciliations",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, statusFilter, toast])

  useEffect(() => {
    fetchReconciliations()
  }, [fetchReconciliations])

  const handleRunReconciliation = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive"
      })
      return
    }

    try {
      setRunLoading(true)
      await adminPaymentService.runReconciliation({
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString()
      })
      toast({
        title: "Success",
        description: "Reconciliation started successfully",
      })
      setRunDialogOpen(false)
      setStartDate("")
      setEndDate("")
      fetchReconciliations()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to run reconciliation",
        variant: "destructive"
      })
    } finally {
      setRunLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'COMPLETED': return 'default'
      case 'IN_PROGRESS': return 'secondary'
      case 'COMPLETED_WITH_DISCREPANCIES': return 'outline'
      case 'FAILED': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'COMPLETED_WITH_DISCREPANCIES': return <AlertTriangle className="w-4 h-4 text-orange-600" />
      case 'FAILED': return <AlertTriangle className="w-4 h-4 text-red-600" />
      default: return <Loader2 className="w-4 h-4 animate-spin" />
    }
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Reconciliation</h1>
            <p className="text-gray-600 mt-1">Match payments with hospital and agent settlements</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchReconciliations}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={runDialogOpen} onOpenChange={setRunDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Play className="w-4 h-4 mr-2" />
                  Run Reconciliation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Run New Reconciliation</DialogTitle>
                  <DialogDescription>
                    Select the date range for reconciliation
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRunDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleRunReconciliation} disabled={runLoading}>
                    {runLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    Start Reconciliation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Reconciliation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.pendingAmount)}</div>
              <p className="text-xs text-gray-600 mt-1">In progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Reconciled Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.reconciledAmount)}</div>
              <p className="text-xs text-gray-600 mt-1">Successfully matched</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Discrepancies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.discrepancies}</div>
              <p className="text-xs text-gray-600 mt-1">Need attention</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Reconciliation History</CardTitle>
                <CardDescription>{totalRecords} total records</CardDescription>
              </div>
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="COMPLETED_WITH_DISCREPANCIES">With Discrepancies</SelectItem>
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
            ) : reconciliations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No reconciliation records found</p>
                <Button className="mt-4" onClick={() => setRunDialogOpen(true)}>
                  Run Your First Reconciliation
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recon #</TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Total Transactions</TableHead>
                      <TableHead>Matched</TableHead>
                      <TableHead>Mismatched</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reconciliations.map((recon) => (
                      <TableRow key={recon.id}>
                        <TableCell className="font-mono text-sm">{recon.reconciliationNumber}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(recon.startDate)} - {formatDate(recon.endDate)}
                        </TableCell>
                        <TableCell>{recon.totalTransactions}</TableCell>
                        <TableCell className="text-green-600">{recon.matchedTransactions}</TableCell>
                        <TableCell className="text-red-600">{recon.mismatchedTransactions}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(Number(recon.totalAmount))}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(recon.status)}
                            <Badge variant={getStatusVariant(recon.status)}>
                              {recon.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => setSelectedRecon(recon)}>
                            <Eye className="w-4 h-4" />
                          </Button>
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

        {/* Reconciliation Detail Dialog - Clean Professional View */}
        <Dialog open={!!selectedRecon} onOpenChange={() => setSelectedRecon(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            {selectedRecon && (
              <>
                {/* Header with Status */}
                <div className={`px-6 py-5 ${
                  selectedRecon.status === 'COMPLETED' ? 'bg-emerald-600' : 
                  selectedRecon.status === 'IN_PROGRESS' ? 'bg-blue-600' : 'bg-amber-600'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <h2 className="text-lg font-semibold">Reconciliation Report</h2>
                      <p className="text-sm opacity-90 mt-0.5">{selectedRecon.reconciliationNumber}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      selectedRecon.status === 'COMPLETED' ? 'bg-white/20 text-white' : 
                      selectedRecon.status === 'IN_PROGRESS' ? 'bg-white/20 text-white' : 'bg-white/20 text-white'
                    }`}>
                      {selectedRecon.status === 'COMPLETED' && <CheckCircle className="w-4 h-4 inline mr-1.5" />}
                      {selectedRecon.status === 'IN_PROGRESS' && <Loader2 className="w-4 h-4 inline mr-1.5 animate-spin" />}
                      {selectedRecon.status.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>

                {/* Match Rate Highlight */}
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Match Rate</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {selectedRecon.totalTransactions > 0 
                        ? ((selectedRecon.matchedTransactions / selectedRecon.totalTransactions) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-700 ${
                        (selectedRecon.matchedTransactions / selectedRecon.totalTransactions) * 100 >= 90 
                          ? 'bg-emerald-500' 
                          : (selectedRecon.matchedTransactions / selectedRecon.totalTransactions) * 100 >= 70 
                            ? 'bg-amber-500' 
                            : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${selectedRecon.totalTransactions > 0 
                          ? (selectedRecon.matchedTransactions / selectedRecon.totalTransactions) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Main Content */}
                <div className="px-6 py-5 space-y-5">
                  {/* Transaction Stats */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{selectedRecon.totalTransactions}</p>
                      <p className="text-xs text-gray-500 mt-1">Total</p>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-600">{selectedRecon.matchedTransactions}</p>
                      <p className="text-xs text-emerald-600 mt-1">Matched</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{selectedRecon.mismatchedTransactions}</p>
                      <p className="text-xs text-red-600 mt-1">Mismatched</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <p className="text-2xl font-bold text-amber-600">{selectedRecon.incompleteTransactions}</p>
                      <p className="text-xs text-amber-600 mt-1">Incomplete</p>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="border rounded-lg divide-y">
                    <div className="flex justify-between items-center p-4">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="text-lg font-semibold">{formatCurrency(Number(selectedRecon.totalAmount))}</span>
                    </div>
                    <div className="flex justify-between items-center p-4">
                      <span className="text-gray-600">Matched Amount</span>
                      <span className="text-lg font-semibold text-emerald-600">{formatCurrency(Number(selectedRecon.matchedAmount))}</span>
                    </div>
                    <div className="flex justify-between items-center p-4">
                      <span className="text-gray-600">Mismatched Amount</span>
                      <span className="text-lg font-semibold text-red-600">{formatCurrency(Number(selectedRecon.mismatchedAmount))}</span>
                    </div>
                  </div>

                  {/* Period Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Period</p>
                      <p className="font-medium">{formatDate(selectedRecon.startDate)} — {formatDate(selectedRecon.endDate)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Performed By</p>
                      <p className="font-medium truncate">{selectedRecon.performedByEmail}</p>
                    </div>
                  </div>

                  {/* Discrepancies Alert */}
                  {selectedRecon.discrepancies && selectedRecon.discrepancies.length > 0 && (
                    <div className="border border-red-200 rounded-lg overflow-hidden">
                      <div className="bg-red-50 px-4 py-3 flex items-center gap-2 border-b border-red-200">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-800">{selectedRecon.discrepancies.length} Discrepancies Found</span>
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {selectedRecon.discrepancies.slice(0, 5).map((disc, idx) => (
                          <div key={idx} className="px-4 py-3 border-b last:border-b-0 flex justify-between items-center text-sm">
                            <div>
                              <span className="font-mono text-xs text-gray-500">{disc.paymentId?.slice(0, 8)}...</span>
                              <span className="ml-2 text-red-600">{disc.discrepancyType?.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-emerald-600">{disc.expectedStatus || formatCurrency(disc.expectedAmount || 0)}</span>
                              <span className="mx-2 text-gray-400">→</span>
                              <span className="text-red-600">{disc.actualStatus || formatCurrency(disc.actualAmount || 0)}</span>
                            </div>
                          </div>
                        ))}
                        {selectedRecon.discrepancies.length > 5 && (
                          <div className="px-4 py-2 bg-gray-50 text-center text-sm text-gray-500">
                            +{selectedRecon.discrepancies.length - 5} more discrepancies
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Success State */}
                  {(!selectedRecon.discrepancies || selectedRecon.discrepancies.length === 0) && 
                    selectedRecon.status === 'COMPLETED' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                      <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <p className="font-medium text-emerald-800">All Transactions Matched Successfully</p>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
                  <Button variant="outline" className="flex-1" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button onClick={() => setSelectedRecon(null)} size="sm" className="px-6">
                    Close
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
