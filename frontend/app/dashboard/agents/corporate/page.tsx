"use client"

import { Card } from "@/components/ui/card"

export default function CorporateAgentsPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Corporate Agents</h1>
        <p className="text-gray-600">Manage corporate partnership agents</p>
        <Card className="p-6"><p>View: Softlogic Health, Ceylinco Insurance, Sampath Bank...</p></Card>
      </div>
    </div>
  )
}
