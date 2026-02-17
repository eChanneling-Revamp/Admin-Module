"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PlatformFeesPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Fees</h1>
            <p className="text-gray-600 mt-1">Configure eChannelling service fees</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">Update Fees</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard Platform Fee</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">LKR 200</div>
              <p className="text-sm text-gray-600 mt-2">Per booking</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Corporate Fee</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">LKR 150</div>
              <p className="text-sm text-gray-600 mt-2">Discounted rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Agent Commission</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-600">5-8%</div>
              <p className="text-sm text-gray-600 mt-2">Of booking value</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
