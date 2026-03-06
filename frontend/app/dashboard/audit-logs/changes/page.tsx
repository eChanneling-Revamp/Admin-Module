"use client"

import { Card } from "@/components/ui/card"

export default function DataChangesAuditPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Data Change Audit Logs</h1>
        <p className="text-gray-600">Track data modifications across the system</p>
        <Card className="p-6"><p>Record updates, deletions, and modifications...</p></Card>
      </div>
    </div>
  )
}
