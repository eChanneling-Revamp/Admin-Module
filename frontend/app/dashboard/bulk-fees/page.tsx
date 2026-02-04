"use client"

import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BulkFeesPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Fee Updates</h1>
          <p className="text-gray-600 mt-1">Update fees for multiple hospitals or doctors at once</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Bulk Update Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Upload CSV or select multiple records to update fees in bulk</p>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
