"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Download, Edit, Trash2 } from "lucide-react"
import { invoiceApi } from "@/lib/api/invoiceApi"
import type { Invoice, PaymentHistory } from "@/lib/types/invoice"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function InvoiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    loadInvoice()
  }, [params.id])

  const loadInvoice = async () => {
    setLoading(true)
    try {
      const data = await invoiceApi.getById(params.id as string)
      if (data) {
        setInvoice(data)
        const history = await invoiceApi.getPaymentHistory(data.id)
        setPaymentHistory(history)
      } else {
        toast({
          title: "Error",
          description: "Invoice not found",
          variant: "destructive",
        })
        router.push("/dashboard/invoices")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load invoice",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!invoice) return
    try {
      toast({
        title: "Downloading",
        description: `Generating PDF for ${invoice.number}...`,
      })
      const blob = await invoiceApi.downloadPDF(invoice.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${invoice.number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!invoice) return
    try {
      await invoiceApi.delete(invoice.id)
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      })
      router.push("/dashboard/invoices")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: Invoice["status"]) => {
    const variants = {
      Paid: "bg-green-100 text-green-800 hover:bg-green-100",
      Pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      Failed: "bg-red-100 text-red-800 hover:bg-red-100",
    }
    return <Badge className={variants[status]}>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
        </div>
      </div>
    )
  }

  if (!invoice) {
    return null
  }

  const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0)
  const tax = 0
  const total = subtotal + tax

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoice Details</h1>
              <p className="text-gray-600 mt-1">{invoice.number}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(invoice.status)}
            <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            {invoice.status === "Pending" && (
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Invoice Header */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Invoice Number</p>
                <p className="font-semibold">{invoice.number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                {getStatusBadge(invoice.status)}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Invoice Date</p>
                <p className="font-semibold">{invoice.invoiceDate.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Due Date</p>
                <p className="font-semibold">{invoice.dueDate.toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Details */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                <p className="font-semibold">{invoice.transactionId}</p>
              </div>
              {invoice.transactionDate && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Transaction Date</p>
                  <p className="font-semibold">{invoice.transactionDate.toLocaleDateString()}</p>
                </div>
              )}
              {invoice.paymentMethod && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                  <p className="font-semibold">{invoice.paymentMethod}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs font-semibold text-gray-600 mb-2">BILL TO:</p>
            <p className="text-sm whitespace-pre-line">{invoice.billTo}</p>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">LKR {item.unitPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">LKR {item.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="space-y-2 pt-4 border-t mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (0%):</span>
                <span className="font-medium">LKR {tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span className="text-blue-600">TOTAL:</span>
                <span className="text-blue-600">LKR {total.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-600 mt-2" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">Payment Received</p>
                        <p className="font-bold text-green-600">LKR {payment.amount.toLocaleString()}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {payment.date.toLocaleDateString()} • {payment.method} • Ref: {payment.reference}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete invoice {invoice.number}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
