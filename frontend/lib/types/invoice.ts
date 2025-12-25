export type InvoiceStatus = "Paid" | "Pending" | "Failed"

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface Invoice {
  id: string
  number: string
  transactionId: string
  amount: number
  status: InvoiceStatus
  invoiceDate: Date
  dueDate: Date
  billTo: string
  items: InvoiceItem[]
  notes?: string
  createdAt?: Date
  transactionDate?: Date
  paymentMethod?: string
}

export interface InvoiceFormData {
  transactionId: string
  invoiceDate: Date
  dueDate: Date
  billTo: string
  items: InvoiceItem[]
  notes?: string
}

export interface Transaction {
  id: string
  number: string
  date: Date
  amount: number
}

export interface PaymentHistory {
  id: string
  date: Date
  amount: number
  method: string
  reference: string
}
