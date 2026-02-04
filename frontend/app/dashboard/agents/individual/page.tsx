"use client"

import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { Card } from "@/components/ui/card"

export default function IndividualAgentsPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Individual Agents</h1>
        <p className="text-gray-600">Manage independent agent network</p>
        <Card className="p-6"><p>View: Individual agents across Sri Lanka...</p></Card>
      </div>
    </ProtectedLayout>
  )
}
