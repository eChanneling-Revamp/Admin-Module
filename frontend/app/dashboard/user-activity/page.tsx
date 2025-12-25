"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, Filter } from "lucide-react"

const activityLogs = [
  { id: 1, user: "Nimal Perera", action: "Updated hospital details", resource: "Asiri Hospital Colombo", timestamp: "2025-10-30 14:35:22", ip: "192.168.1.101", status: "Success" },
  { id: 2, user: "Kamala Silva", action: "Added new doctor", resource: "Dr. Sunil Perera", timestamp: "2025-10-30 13:20:15", ip: "192.168.1.205", status: "Success" },
  { id: 3, user: "Sunil Fernando", action: "Modified agent commission", resource: "Dialog Telco Agent", timestamp: "2025-10-30 12:45:08", ip: "192.168.1.87", status: "Success" },
  { id: 4, user: "Rohan De Silva", action: "Failed login attempt", resource: "Admin Portal", timestamp: "2025-10-30 11:30:42", ip: "203.115.42.18", status: "Failed" },
  { id: 5, user: "Dilani Wickramasinghe", action: "Generated financial report", resource: "Monthly Revenue Report", timestamp: "2025-10-30 10:15:33", ip: "192.168.1.156", status: "Success" },
  { id: 6, user: "Kasun Rajapaksa", action: "Processed refund", resource: "Invoice #LK-2025-8847", timestamp: "2025-10-30 09:50:20", ip: "192.168.1.142", status: "Success" },
  { id: 7, user: "Nadeesha Gunasekara", action: "Updated fee structure", resource: "Lanka Hospitals Platform Fee", timestamp: "2025-10-30 09:25:11", ip: "192.168.1.178", status: "Success" },
  { id: 8, user: "Sanduni Jayawardena", action: "Deleted branch", resource: "Gampaha Sub Branch", timestamp: "2025-10-30 08:40:05", ip: "192.168.1.193", status: "Success" },
]

export default function UserActivityPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Activity Logs</h1>
            <p className="text-gray-600 mt-1">Monitor user actions and system activities</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2,547</div>
              <p className="text-xs text-gray-600 mt-1">Last 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Successful</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">2,521</div>
              <p className="text-xs text-gray-600 mt-1">99.0% success rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Failed Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">26</div>
              <p className="text-xs text-gray-600 mt-1">1.0% failure rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Users Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">34</div>
              <p className="text-xs text-gray-600 mt-1">Across all locations</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Real-time user activity monitoring</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search logs..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.user}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.resource}</TableCell>
                    <TableCell className="text-sm text-gray-600">{log.timestamp}</TableCell>
                    <TableCell className="text-sm text-gray-600">{log.ip}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === "Success" ? "default" : "destructive"}>
                        {log.status}
                      </Badge>
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
