"use client"

import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { Card } from "@/components/ui/card"

export default function CorporateEmployeesPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Corporate Employees</h1>
        <p className="text-gray-600">Manage employee records for corporate accounts</p>
        <Card className="p-6"><p>Employee management interface coming soon...</p></Card>
      </div>
    </ProtectedLayout>
  )
}
