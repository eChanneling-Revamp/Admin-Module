"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Plus } from "lucide-react"

const rolesData = [
  {
    id: 1,
    name: "Super Admin",
    users: 2,
    permissions: ["Full System Access", "User Management", "Financial Operations", "System Configuration"],
    description: "Complete system control"
  },
  {
    id: 2,
    name: "Hospital Manager",
    users: 15,
    permissions: ["Hospital Management", "Doctor Schedules", "View Reports", "Patient Records"],
    description: "Manage hospital operations"
  },
  {
    id: 3,
    name: "Agent Manager",
    users: 8,
    permissions: ["Agent Management", "Commission Settings", "View Analytics", "Generate Reports"],
    description: "Oversee agent network"
  },
  {
    id: 4,
    name: "Finance Manager",
    users: 5,
    permissions: ["Financial Reports", "Payment Reconciliation", "Invoice Management", "Refund Processing"],
    description: "Handle financial operations"
  },
  {
    id: 5,
    name: "Support Staff",
    users: 20,
    permissions: ["View Bookings", "Customer Support", "Basic Reports", "Ticket Management"],
    description: "Customer service operations"
  },
]

export default function RolesPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roles & Privileges</h1>
            <p className="text-gray-600 mt-1">Manage user roles and access permissions</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create New Role
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{rolesData.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{rolesData.reduce((acc, role) => acc + role.users, 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{rolesData.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Custom Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Roles</CardTitle>
            <CardDescription>Define and manage access control for different user types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rolesData.map((role) => (
                <div key={role.id} className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{role.name}</h3>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {role.permissions.map((permission, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-blue-600">{role.users}</div>
                      <div className="text-xs text-gray-600">users</div>
                      <Button variant="outline" size="sm" className="mt-2">
                        Edit Role
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
