"use client"

import { Card } from "@/components/ui/card"

export default function EmailServicesPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Email Service Integrations</h1>
        <p className="text-gray-600">Configure email notification systems</p>
        <Card className="p-6"><p>SendGrid, AWS SES, SMTP configurations...</p></Card>
      </div>
    </div>
  )
}
