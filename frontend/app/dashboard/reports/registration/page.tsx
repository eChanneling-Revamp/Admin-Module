"use client"

import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { Card } from "@/components/ui/card"

export default function RegistrationReportsPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Registration Reports</h1>
        <p className="text-gray-600">Patient registration trends and statistics</p>
        <Card className="p-6"><p>Registration analytics coming soon...</p></Card>
      </div>
    </ProtectedLayout>
  )
}
