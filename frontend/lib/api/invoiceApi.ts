import type { Invoice, InvoiceFormData, Transaction, PaymentHistory } from "@/lib/types/invoice"

const mockInvoices: Invoice[] = [
  {
    id: "1",
    number: "INV-2024-00001",
    amount: 25000,
    transactionId: "TRX-2024-00145",
    status: "Paid",
    invoiceDate: new Date("2024-12-15"),
    dueDate: new Date("2025-01-14"),
    billTo: "Central Hospital\n123 Main Street\nColombo 07\nSri Lanka",
    items: [
      { id: "1", description: "Consultation Fee", quantity: 1, unitPrice: 15000, amount: 15000 },
      { id: "2", description: "Lab Tests", quantity: 2, unitPrice: 5000, amount: 10000 },
    ],
    notes: "Payment received via bank transfer",
    createdAt: new Date("2024-12-15"),
    transactionDate: new Date("2024-12-15"),
    paymentMethod: "Bank Transfer",
  },
  {
    id: "2",
    number: "INV-2024-00002",
    amount: 18500,
    transactionId: "TRX-2024-00146",
    status: "Pending",
    invoiceDate: new Date("2024-12-16"),
    dueDate: new Date("2025-01-15"),
    billTo: "City Medical Center\n456 Park Avenue\nKandy\nSri Lanka",
    items: [{ id: "1", description: "Surgery Fee", quantity: 1, unitPrice: 18500, amount: 18500 }],
    notes: "Awaiting payment confirmation",
    createdAt: new Date("2024-12-16"),
    transactionDate: new Date("2024-12-16"),
    paymentMethod: "Credit Card",
  },
  {
    id: "3",
    number: "INV-2024-00003",
    amount: 32000,
    transactionId: "TRX-2024-00147",
    status: "Paid",
    invoiceDate: new Date("2024-12-17"),
    dueDate: new Date("2025-01-16"),
    billTo: "Galle General Hospital\n789 Beach Road\nGalle\nSri Lanka",
    items: [
      { id: "1", description: "Specialist Consultation", quantity: 2, unitPrice: 12000, amount: 24000 },
      { id: "2", description: "X-Ray", quantity: 1, unitPrice: 8000, amount: 8000 },
    ],
    createdAt: new Date("2024-12-17"),
    transactionDate: new Date("2024-12-17"),
    paymentMethod: "Cash",
  },
  {
    id: "4",
    number: "INV-2024-00004",
    amount: 15000,
    transactionId: "TRX-2024-00148",
    status: "Failed",
    invoiceDate: new Date("2024-12-18"),
    dueDate: new Date("2025-01-17"),
    billTo: "Negombo Medical Clinic\n321 Hospital Road\nNegombo\nSri Lanka",
    items: [{ id: "1", description: "General Checkup", quantity: 1, unitPrice: 15000, amount: 15000 }],
    notes: "Payment failed - card declined",
    createdAt: new Date("2024-12-18"),
    transactionDate: new Date("2024-12-18"),
    paymentMethod: "Credit Card",
  },
  {
    id: "5",
    number: "INV-2024-00005",
    amount: 42000,
    transactionId: "TRX-2024-00149",
    status: "Pending",
    invoiceDate: new Date("2024-12-19"),
    dueDate: new Date("2025-01-18"),
    billTo: "Matara District Hospital\n555 Main Street\nMatara\nSri Lanka",
    items: [
      { id: "1", description: "Emergency Treatment", quantity: 1, unitPrice: 30000, amount: 30000 },
      { id: "2", description: "Medication", quantity: 1, unitPrice: 12000, amount: 12000 },
    ],
    createdAt: new Date("2024-12-19"),
    transactionDate: new Date("2024-12-19"),
    paymentMethod: "Bank Transfer",
  },
]

const mockTransactions: Transaction[] = [
  { id: "TRX-2024-00145", number: "TRX-2024-00145", date: new Date("2024-12-15"), amount: 25000 },
  { id: "TRX-2024-00146", number: "TRX-2024-00146", date: new Date("2024-12-16"), amount: 18500 },
  { id: "TRX-2024-00147", number: "TRX-2024-00147", date: new Date("2024-12-17"), amount: 32000 },
  { id: "TRX-2024-00148", number: "TRX-2024-00148", date: new Date("2024-12-18"), amount: 15000 },
  { id: "TRX-2024-00149", number: "TRX-2024-00149", date: new Date("2024-12-19"), amount: 42000 },
  { id: "TRX-2024-00150", number: "TRX-2024-00150", date: new Date("2024-12-20"), amount: 28000 },
]

export const invoiceApi = {
  getAll: async (): Promise<Invoice[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockInvoices
  },

  getById: async (id: string): Promise<Invoice | null> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockInvoices.find((inv) => inv.id === id) || null
  },

  getTransactions: async (): Promise<Transaction[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockTransactions
  },

  getTransaction: async (id: string): Promise<Transaction | null> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockTransactions.find((t) => t.id === id) || null
  },

  generate: async (data: InvoiceFormData): Promise<Invoice> => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      number: `INV-2024-${String(Date.now()).slice(-5)}`,
      status: "Pending",
      amount: data.items.reduce((sum, item) => sum + item.amount, 0),
      transactionId: data.transactionId,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      billTo: data.billTo,
      items: data.items,
      notes: data.notes,
      createdAt: new Date(),
    }

    mockInvoices.unshift(newInvoice)
    return newInvoice
  },

  downloadPDF: async (id: string): Promise<Blob> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return new Blob(["Mock PDF content for invoice " + id], { type: "application/pdf" })
  },

  delete: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockInvoices.findIndex((inv) => inv.id === id)
    if (index > -1) {
      mockInvoices.splice(index, 1)
    }
  },

  getPaymentHistory: async (invoiceId: string): Promise<PaymentHistory[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Return payment history only for paid invoices
    const invoice = mockInvoices.find((inv) => inv.id === invoiceId)
    if (invoice?.status === "Paid") {
      return [
        {
          id: "1",
          date: invoice.invoiceDate,
          amount: invoice.amount,
          method: invoice.paymentMethod || "Bank Transfer",
          reference: `REF-${invoice.number}`,
        },
      ]
    }
    return []
  },
}
