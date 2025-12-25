"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FailedPaymentsPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Failed Payments</h1>
          <p className="text-gray-600 mt-1">Monitor and resolve payment failures</p>
        </div>
        <Card>
          <CardHeader><CardTitle>Failed Transactions (Last 24hrs)</CardTitle></CardHeader>
          <CardContent><div className="text-4xl font-bold text-red-600">22</div></CardContent>
        </Card>
      </div>
    </div>
  )
}
