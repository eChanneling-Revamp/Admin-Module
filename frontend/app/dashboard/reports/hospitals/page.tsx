"use client"

import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { Card } from "@/components/ui/card"

export default function HospitalAnalyticsPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Hospital Analytics</h1>
        <p className="text-gray-600">Comprehensive hospital performance metrics</p>
        <Card className="p-6"><p>Hospital analytics dashboard coming soon...</p></Card>
      </div>
    </ProtectedLayout>
  )
}
