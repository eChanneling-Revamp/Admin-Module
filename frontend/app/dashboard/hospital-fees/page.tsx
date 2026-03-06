"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, Edit } from "lucide-react"

const hospitalFeesData = [
  { hospital: "Asiri Hospital Colombo", consultation: "LKR 2,500", followUp: "LKR 1,500", platformFee: "LKR 200", total: "LKR 4,200", status: "Active" },
  { hospital: "Lanka Hospitals", consultation: "LKR 2,800", followUp: "LKR 1,700", platformFee: "LKR 220", total: "LKR 4,720", status: "Active" },
  { hospital: "Nawaloka Hospital", consultation: "LKR 2,300", followUp: "LKR 1,400", platformFee: "LKR 180", total: "LKR 3,880", status: "Active" },
  { hospital: "Durdans Hospital", consultation: "LKR 2,700", followUp: "LKR 1,600", platformFee: "LKR 210", total: "LKR 4,510", status: "Active" },
  { hospital: "Oasis Hospital", consultation: "LKR 2,200", followUp: "LKR 1,300", platformFee: "LKR 170", total: "LKR 3,670", status: "Active" },
  { hospital: "Central Hospital Kandy", consultation: "LKR 2,000", followUp: "LKR 1,200", platformFee: "LKR 150", total: "LKR 3,350", status: "Active" },
  { hospital: "Ninewells Hospital", consultation: "LKR 2,400", followUp: "LKR 1,450", platformFee: "LKR 190", total: "LKR 4,040", status: "Active" },
]

export default function HospitalFeesPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hospital Fees</h1>
            <p className="text-gray-600 mt-1">Manage hospital-specific consultation and service fees</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Edit className="w-4 h-4 mr-2" />
            Bulk Update Fees
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Consultation Fee</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">LKR 2,414</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Follow-up Fee</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">LKR 1,450</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Platform Fee</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">LKR 189</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Hospitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{hospitalFeesData.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hospital Fee Structure</CardTitle>
            <CardDescription>Current fee configuration for each hospital</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Consultation Fee</TableHead>
                  <TableHead>Follow-up Fee</TableHead>
                  <TableHead>Platform Fee</TableHead>
                  <TableHead>Total Patient Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hospitalFeesData.map((fee, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{fee.hospital}</TableCell>
                    <TableCell className="font-semibold text-blue-600">{fee.consultation}</TableCell>
                    <TableCell className="font-semibold text-green-600">{fee.followUp}</TableCell>
                    <TableCell className="font-semibold text-purple-600">{fee.platformFee}</TableCell>
                    <TableCell className="font-bold">{fee.total}</TableCell>
                    <TableCell>
                      <Badge variant="default">{fee.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
