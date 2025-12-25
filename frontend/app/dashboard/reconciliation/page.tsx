"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReconciliationPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Reconciliation</h1>
          <p className="text-gray-600 mt-1">Match payments with hospital and agent settlements</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle>Pending Reconciliation</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-orange-600">LKR 4.2M</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Reconciled Today</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-green-600">LKR 1.8M</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Discrepancies</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-red-600">3</div></CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
