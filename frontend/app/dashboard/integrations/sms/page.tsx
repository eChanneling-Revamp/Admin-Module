"use client"

import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { Card } from "@/components/ui/card"

export default function SMSProvidersPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">SMS Provider Integrations</h1>
        <p className="text-gray-600">Configure SMS notification services</p>
        <Card className="p-6"><p>Dialog SMS, Mobitel SMS, Hutch SMS...</p></Card>
      </div>
    </ProtectedLayout>
  )
}
