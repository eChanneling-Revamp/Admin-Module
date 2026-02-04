"use client"

import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { Card } from "@/components/ui/card"

export default function APIKeysPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">API Keys Management</h1>
        <p className="text-gray-600">Manage API keys for third-party integrations</p>
        <Card className="p-6"><p>Create, rotate, and revoke API keys...</p></Card>
      </div>
    </ProtectedLayout>
  )
}
