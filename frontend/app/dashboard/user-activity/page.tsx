"use client"

import { useEffect, useState } from "react"
import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, Filter } from "lucide-react"
import { userApi, type User } from "@/lib/api/userApi"

type ActivityLog = {
  id: string | number
  user: string
  action: string
  resource: string
  timestamp: string
  ip?: string
  status: string
}

const FALLBACK_LOGS: ActivityLog[] = [
  { id: 1, user: "System", action: "No recent activity", resource: "users", timestamp: new Date().toISOString(), status: "Info" }
]

export default function UserActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>(FALLBACK_LOGS)
  const [loading, setLoading] = useState(false)
  const [live, setLive] = useState(false)

  const fetchLogsFromUsers = async () => {
    setLoading(true)
    try {
      // fetch recent users sorted by lastLoginAt (descending)
      const res = await userApi.getAll({ page: 1, limit: 10, sortBy: 'lastLoginAt', sortOrder: 'desc' })
      const users = res.users as User[]

      if (Array.isArray(users) && users.length > 0) {
        const mapped: ActivityLog[] = users.map((u) => ({
          id: u.id,
          user: u.name || u.email,
          action: u.lastLoginAt ? 'User login' : 'User account',
          resource: u.role || 'user',
          timestamp: (u.lastLoginAt || u.createdAt) as string,
          status: u.isActive ? 'Success' : 'Inactive'
        }))
        setLogs(mapped)
      } else {
        setLogs(FALLBACK_LOGS)
      }
    } catch (error) {
      console.error('Failed to fetch users for activity logs', error)
      setLogs(FALLBACK_LOGS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogsFromUsers()
    if (!live) return

    const id = setInterval(() => {
      fetchLogsFromUsers()
    }, 10000) // poll every 10s

    return () => clearInterval(id)
  }, [live])

  const exportLogsAsPDF = () => {
    try {
      const cols = ['User', 'Action', 'Resource', 'Timestamp', 'IP', 'Status']
      const rows = logs.map(l => [l.user, l.action, l.resource, new Date(l.timestamp).toLocaleString(), l.ip || '-', l.status])

      const htmlRows = rows.map(r => `
        <tr>
          ${r.map(c => `<td style="padding:8px;border:1px solid #ddd">${String(c)}</td>`).join('')}
        </tr>
      `).join('')

      const html = `
        <html>
          <head>
            <title>User Activity Logs</title>
          </head>
          <body>
            <h2>User Activity Logs</h2>
            <table style="border-collapse:collapse;width:100%">
              <thead>
                <tr>
                  ${cols.map(c => `<th style="padding:8px;border:1px solid #ddd;background:#f5f5f5">${c}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${htmlRows}
              </tbody>
            </table>
          </body>
        </html>
      `

      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('Unable to open print window. Please allow popups for this site.')
        return
      }

      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      // small timeout to ensure rendering
      setTimeout(() => {
        printWindow.print()
      }, 300)
    } catch (error) {
      console.error('Export PDF failed', error)
      alert('Export failed')
    }
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Activity Logs</h1>
            <p className="text-gray-600 mt-1">Monitor user actions and system activities (live from users table)</p>
          </div>
            <div className="flex flex-row gap-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={() => setLive(!live)}>
              {live ? 'Live: ON' : 'Live: OFF'}
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={exportLogsAsPDF} disabled={loading || logs.length === 0}>
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
              <div className="text-3xl font-bold">{logs.length}</div>
              <p className="text-xs text-gray-600 mt-1">Showing recent items</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{logs.filter(l => l.status === 'Success').length}</div>
              <p className="text-xs text-gray-600 mt-1">Active entries</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{logs.filter(l => l.status === 'Inactive').length}</div>
              <p className="text-xs text-gray-600 mt-1">Inactive entries</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Users</div>
              <p className="text-xs text-gray-600 mt-1">Sourced from users table</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Real-time user activity monitoring</CardDescription>
              </div>
              <div className="relative w-full md:w-64">
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell className="text-sm text-gray-600">{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-gray-600">{log.ip || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={log.status === "Success" ? "default" : "destructive"}>
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
