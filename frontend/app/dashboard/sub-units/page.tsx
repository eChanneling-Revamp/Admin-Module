"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building, Plus } from "lucide-react"

const subUnits = [
  { id: 1, name: "Colombo Central Sub-Unit", parentBranch: "Colombo Main Branch", manager: "Nimal Perera", staff: 5, bookings: 450, status: "Active" },
  { id: 2, name: "Kandy City Sub-Unit", parentBranch: "Kandy Branch", manager: "Kamala Silva", staff: 4, bookings: 320, status: "Active" },
  { id: 3, name: "Galle Fort Sub-Unit", parentBranch: "Galle Branch", manager: "Sunil Fernando", staff: 3, bookings: 180, status: "Active" },
  { id: 4, name: "Negombo Beach Sub-Unit", parentBranch: "Negombo Branch", manager: "Rohan Silva", staff: 3, bookings: 150, status: "Active" },
  { id: 5, name: "Kurunegala Sub-Unit", parentBranch: "Kurunegala Branch", manager: "Dilani Jayawardena", staff: 2, bookings: 95, status: "Inactive" },
]

export default function SubUnitsPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Branch Sub-Units</h1>
            <p className="text-gray-600 mt-1">Manage subsidiary locations and sub-branches</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Sub-Unit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sub-Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{subUnits.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Sub-Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{subUnits.filter(s => s.status === "Active").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{subUnits.reduce((acc, s) => acc + s.staff, 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{subUnits.reduce((acc, s) => acc + s.bookings, 0).toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Sub-Units</CardTitle>
            <CardDescription>Branch subsidiary locations and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sub-Unit Name</TableHead>
                  <TableHead>Parent Branch</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Staff Count</TableHead>
                  <TableHead>Monthly Bookings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-600" />
                        {unit.name}
                      </div>
                    </TableCell>
                    <TableCell>{unit.parentBranch}</TableCell>
                    <TableCell>{unit.manager}</TableCell>
                    <TableCell>{unit.staff}</TableCell>
                    <TableCell className="font-semibold">{unit.bookings}</TableCell>
                    <TableCell>
                      <Badge variant={unit.status === "Active" ? "default" : "secondary"}>
                        {unit.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Manage</Button>
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
