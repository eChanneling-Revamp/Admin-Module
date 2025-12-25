"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RefundsPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Refund Management</h1>
          <p className="text-gray-600 mt-1">Process and track refund requests</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle>Pending Refunds</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-orange-600">8</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Processed Today</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-green-600">15</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Total Amount</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">LKR 127K</div></CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
