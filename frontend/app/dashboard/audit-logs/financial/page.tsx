"use client"

import { Card } from "@/components/ui/card"

export default function FinancialAuditPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Financial Audit Logs</h1>
        <p className="text-gray-600">Track all financial transactions and changes</p>
        <Card className="p-6"><p>Payment modifications, refunds, fee changes...</p></Card>
      </div>
    </div>
  )
}
