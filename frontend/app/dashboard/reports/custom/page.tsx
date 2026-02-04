"use client"

import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { Card } from "@/components/ui/card"

export default function CustomReportsPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Custom Reports</h1>
        <p className="text-gray-600">Create custom reports with flexible parameters</p>
        <Card className="p-6"><p>Custom report builder coming soon...</p></Card>
      </div>
    </ProtectedLayout>
  )
}
