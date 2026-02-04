"use client"

import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { Card } from "@/components/ui/card"

export default function SecurityEventsPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Security Event Logs</h1>
        <p className="text-gray-600">Monitor security-related activities</p>
        <Card className="p-6"><p>Login attempts, permission changes, suspicious activities...</p></Card>
      </div>
    </ProtectedLayout>
  )
}
