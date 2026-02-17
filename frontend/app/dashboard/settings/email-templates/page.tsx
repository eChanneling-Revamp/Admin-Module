"use client"

import { Card } from "@/components/ui/card"

export default function EmailTemplatesPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Email Templates</h1>
        <p className="text-gray-600">Customize email notifications</p>
        <Card className="p-6"><p>Booking confirmation, reminders, receipts templates...</p></Card>
      </div>
    </div>
  )
}
