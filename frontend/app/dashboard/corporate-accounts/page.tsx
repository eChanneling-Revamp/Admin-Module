"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building, Users } from "lucide-react"

const corporateAccounts = [
  { id: 1, company: "Dialog Axiata PLC", employees: 2500, activeUsers: 1850, creditLimit: "LKR 10M", used: "LKR 3.2M", status: "Active", location: "Colombo" },
  { id: 2, company: "Softlogic Holdings", employees: 1800, activeUsers: 1350, creditLimit: "LKR 8M", used: "LKR 2.8M", status: "Active", location: "Colombo" },
  { id: 3, company: "John Keells Holdings", employees: 3200, activeUsers: 2400, creditLimit: "LKR 15M", used: "LKR 5.1M", status: "Active", location: "Colombo" },
  { id: 4, company: "Hemas Holdings", employees: 1200, activeUsers: 890, creditLimit: "LKR 6M", used: "LKR 1.9M", status: "Active", location: "Colombo" },
  { id: 5, company: "MAS Holdings", employees: 4500, activeUsers: 3100, creditLimit: "LKR 20M", used: "LKR 7.8M", status: "Active", location: "Colombo" },
  { id: 6, company: "Aitken Spence", employees: 1500, activeUsers: 1100, creditLimit: "LKR 7M", used: "LKR 2.3M", status: "Active", location: "Colombo" },
]

export default function CorporateAccountsPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Corporate Accounts</h1>
            <p className="text-gray-600 mt-1">Manage corporate partnerships and employee benefits</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Building className="w-4 h-4 mr-2" />
            Add Corporate Account
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{corporateAccounts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{corporateAccounts.reduce((acc, c) => acc + c.employees, 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{corporateAccounts.reduce((acc, c) => acc + c.activeUsers, 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Credit Limit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">LKR 66M</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Corporate Accounts</CardTitle>
            <CardDescription>Active corporate partnerships and credit facilities</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Active Users</TableHead>
                  <TableHead>Credit Limit</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {corporateAccounts.map((account) => {
                  const usedAmount = parseFloat(account.used.replace(/[^0-9.]/g, ''))
                  const limitAmount = parseFloat(account.creditLimit.replace(/[^0-9.]/g, ''))
                  const available = limitAmount - usedAmount
                  const usagePercent = (usedAmount / limitAmount * 100).toFixed(0)
                  
                  return (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.company}</TableCell>
                      <TableCell>{account.employees.toLocaleString()}</TableCell>
                      <TableCell className="text-green-600 font-semibold">{account.activeUsers.toLocaleString()}</TableCell>
                      <TableCell>{account.creditLimit}</TableCell>
                      <TableCell className="text-orange-600">{account.used}</TableCell>
                      <TableCell className="text-green-600">LKR {available.toFixed(1)}M</TableCell>
                      <TableCell>{account.location}</TableCell>
                      <TableCell>
                        <Badge variant="default">{account.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Manage</Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
