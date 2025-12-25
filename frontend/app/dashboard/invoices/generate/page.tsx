"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Trash2, Eye } from "lucide-react"
import { invoiceApi } from "@/lib/api/invoiceApi"
import type { Transaction, InvoiceItem, InvoiceFormData } from "@/lib/types/invoice"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function GenerateInvoicePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
  const [billTo, setBillTo] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, amount: 0 },
  ])
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const data = await invoiceApi.getTransactions()
      setTransactions(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      })
    }
  }

  const handleTransactionSelect = async (transactionId: string) => {
    try {
      const transaction = await invoiceApi.getTransaction(transactionId)
      setSelectedTransaction(transaction)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load transaction details",
        variant: "destructive",
      })
    }
  }

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0, amount: 0 }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updated.amount = updated.quantity * updated.unitPrice
          }
          return updated
        }
        return item
      }),
    )
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0)
  }

  const handleGenerate = async () => {
    // Validation
    if (!selectedTransaction) {
      toast({
        title: "Validation Error",
        description: "Please select a transaction",
        variant: "destructive",
      })
      return
    }

    if (!billTo.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter billing information",
        variant: "destructive",
      })
      return
    }

    if (items.some((item) => !item.description.trim() || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all item details correctly",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const formData: InvoiceFormData = {
        transactionId: selectedTransaction.id,
        invoiceDate: new Date(invoiceDate),
        dueDate: new Date(dueDate),
        billTo,
        items,
        notes,
      }

      const invoice = await invoiceApi.generate(formData)

      toast({
        title: "Success",
        description: `Invoice ${invoice.number} generated successfully`,
      })

      // Download PDF
      const blob = await invoiceApi.downloadPDF(invoice.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${invoice.number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      router.push("/dashboard/invoices")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate invoice",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const invoiceNumber = `INV-2024-${String(Date.now()).slice(-5)}`
  const subtotal = calculateTotal()
  const tax = 0
  const total = subtotal + tax

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="text-2xl">Generate New Invoice</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transaction Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Transaction Details</h3>
              <div className="space-y-2">
                <Label>Transaction ID</Label>
                <Select onValueChange={handleTransactionSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a transaction" />
                  </SelectTrigger>
                  <SelectContent>
                    {transactions.map((transaction) => (
                      <SelectItem key={transaction.id} value={transaction.id}>
                        {transaction.number} - LKR {transaction.amount.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTransaction && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Transaction Date</Label>
                    <Input value={selectedTransaction.date.toLocaleDateString()} disabled />
                  </div>
                  <div>
                    <Label className="text-gray-600">Transaction Amount</Label>
                    <Input value={`LKR ${selectedTransaction.amount.toLocaleString()}`} disabled />
                  </div>
                </div>
              )}
            </div>

            {/* Invoice Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Invoice Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Number</Label>
                  <Input value={invoiceNumber} disabled />
                </div>
                <div>
                  <Label>Invoice Date</Label>
                  <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Billing Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Billing Information</h3>
              <div>
                <Label>Bill To</Label>
                <Textarea
                  placeholder="Enter billing address..."
                  rows={4}
                  value={billTo}
                  onChange={(e) => setBillTo(e.target.value)}
                />
              </div>
              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any notes..."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Invoice Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Invoice Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-24">Quantity</TableHead>
                      <TableHead className="w-32">Unit Price</TableHead>
                      <TableHead className="w-32">Amount</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            placeholder="Item description"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">LKR {item.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            disabled={items.length === 1}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button variant="outline" onClick={addItem} className="w-full border-dashed bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {/* Summary */}
            <div className="space-y-2 pt-4 border-t">
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

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowPreview(true)} className="flex-1">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleGenerate} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
                {loading ? "Generating..." : "Save & Download"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>Review your invoice before generating</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 p-6 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-blue-600">INVOICE</h2>
                <p className="text-sm text-gray-600 mt-1">{invoiceNumber}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-600">Invoice Date: {new Date(invoiceDate).toLocaleDateString()}</p>
                <p className="text-gray-600">Due Date: {new Date(dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">BILL TO:</p>
              <p className="text-sm whitespace-pre-line">{billTo}</p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">LKR {item.unitPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">LKR {item.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (0%):</span>
                <span>LKR {tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>TOTAL:</span>
                <span className="text-blue-600">LKR {total.toLocaleString()}</span>
              </div>
            </div>

            {notes && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">NOTES:</p>
                <p className="text-sm text-gray-700">{notes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
