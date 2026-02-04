"use client"

import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { Card } from "@/components/ui/card"

export default function TelcoAgentsPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Telco Agents</h1>
        <p className="text-gray-600">Manage telecommunications partner agents</p>
        <Card className="p-6"><p>View: Dialog Axiata, Mobitel (SLT), Hutch Sri Lanka...</p></Card>
      </div>
    </ProtectedLayout>
  )
}
