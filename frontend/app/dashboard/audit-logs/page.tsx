"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Download, AlertCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const auditData = [
  { id: 1, event: "Fee Structure Modified", user: "Kasun Rajapaksa", resource: "Lanka Hospitals Platform Fee", action: "Update", timestamp: "Oct 30, 14:35:22", severity: "High", ip: "192.168.1.142" },
  { id: 2, event: "User Role Changed", user: "Nimal Perera", resource: "Dilani Wickramasinghe", action: "Role Update", timestamp: "Oct 30, 13:20:15", severity: "Medium", ip: "192.168.1.101" },
  { id: 3, event: "Payment Refund Processed", user: "Kasun Rajapaksa", resource: "TXN-2025-8723", action: "Refund", timestamp: "Oct 30, 12:15:08", severity: "High", ip: "192.168.1.142" },
  { id: 4, event: "Hospital Added", user: "Kamala Silva", resource: "Ninewells Hospital Matara", action: "Create", timestamp: "Oct 30, 11:30:42", severity: "High", ip: "192.168.1.205" },
  { id: 5, event: "Discount Code Created", user: "Nadeesha Gunasekara", resource: "WEEKEND10", action: "Create", timestamp: "Oct 30, 10:15:33", severity: "Medium", ip: "192.168.1.178" },
  { id: 6, event: "Doctor Schedule Modified", user: "Kamala Silva", resource: "Dr. Sunil Perera", action: "Update", timestamp: "Oct 30, 09:50:20", severity: "Low", ip: "192.168.1.205" },
  { id: 7, event: "Branch Deleted", user: "Sanduni Jayawardena", resource: "Gampaha Sub Branch", action: "Delete", timestamp: "Oct 30, 08:40:05", severity: "Critical", ip: "192.168.1.193" },
]

export default function AuditLogsPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600 mt-1">Complete system activity tracking and security monitoring</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12,547</div>
              <p className="text-xs text-gray-600 mt-1">Last 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Critical Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">47</div>
              <p className="text-xs text-gray-600 mt-1">Requires review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">High Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">234</div>
              <p className="text-xs text-gray-600 mt-1">Important changes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">52</div>
              <p className="text-xs text-gray-600 mt-1">Today</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div>
                <CardTitle className="text-orange-900">Security Alerts</CardTitle>
                <CardDescription className="text-orange-700">Recent suspicious activities detected</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Multiple failed login attempts</p>
                  <p className="text-xs text-gray-600">IP: 203.115.42.18 • Oct 30, 11:30</p>
                </div>
                <Badge variant="destructive">Critical</Badge>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Unusual data export activity</p>
                  <p className="text-xs text-gray-600">User: Unknown • Oct 29, 23:45</p>
                </div>
                <Badge variant="destructive">High</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <CardTitle>Recent Audit Events</CardTitle>
                <CardDescription>System-wide activity log and change tracking</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditData.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.event}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell className="text-sm">{log.resource}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{log.timestamp}</TableCell>
                    <TableCell>
                      <Badge variant={
                        log.severity === "Critical" ? "destructive" :
                        log.severity === "High" ? "default" :
                        log.severity === "Medium" ? "secondary" : "outline"
                      }>
                        {log.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{log.ip}</TableCell>
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
