"use client"

import { Card } from "@/components/ui/card"

export default function SystemConfigPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">System Configuration</h1>
        <p className="text-gray-600">Advanced system settings and parameters</p>
        <Card className="p-6"><p>Database, caching, API rate limits, security policies...</p></Card>
      </div>
    </div>
  )
}
