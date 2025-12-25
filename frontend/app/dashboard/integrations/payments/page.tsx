"use client"

import { Card } from "@/components/ui/card"

export default function PaymentGatewaysPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Payment Gateway Integrations</h1>
        <p className="text-gray-600">Configure payment processing systems</p>
        <Card className="p-6"><p>PayHere, iPay, Card.lk integrations...</p></Card>
      </div>
    </div>
  )
}
