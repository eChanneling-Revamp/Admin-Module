"use client"

import { Card } from "@/components/ui/card"

export default function SMSTemplatesPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">SMS Templates</h1>
        <p className="text-gray-600">Customize SMS notifications</p>
        <Card className="p-6"><p>OTP, booking alerts, reminder SMS templates...</p></Card>
      </div>
    </div>
  )
}
