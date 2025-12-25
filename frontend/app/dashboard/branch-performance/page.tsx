"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BranchPerformancePage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Branch Performance</h1>
          <p className="text-gray-600 mt-1">Analytics and metrics for all branches</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle>Top Performing</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-blue-600">Colombo Main</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">LKR 8.5M</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Avg Bookings/Branch</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">547</div></CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
