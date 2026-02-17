"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, Filter, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { userApi, type User } from "@/lib/api/userApi"
import { doctorApi, type Doctor } from "@/lib/api/doctorApi"
import { agentApi, type Agent } from "@/lib/api/agentApi"

interface ActivityLog {
  id: string
  user: string
  action: string
  resource: string
  timestamp: string
  isoTimestamp: string
  ip: string // We don't have real IP, so we might mock or omit
  status: "Success" | "Failed"
}

export default function UserActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    activeToday: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [usersData, doctors, agentsData] = await Promise.all([
          userApi.getAll({ limit: 100, sortOrder: 'desc', sortBy: 'createdAt' }),
          doctorApi.getAll(),
          agentApi.getAll({ limit: 100, sortOrder: 'desc', sortBy: 'createdAt' })
        ])

        const users = usersData.users
        const agents = agentsData.agents

        const activities: ActivityLog[] = []

        // Process Users (Registration & Login)
        users.forEach(user => {
          // Registration event
          activities.push({
            id: `user-create-${user.id}`,
            user: user.name || user.email,
            action: "User Registered",
            resource: "System",
            timestamp: new Date(user.createdAt).toLocaleString(),
            isoTimestamp: user.createdAt,
            ip: "192.168.x.x",
            status: "Success"
          })

          // Last login event (if available)
          if (user.lastLoginAt) {
            activities.push({
              id: `user-login-${user.id}`,
              user: user.name || user.email,
              action: "User Login",
              resource: "Admin Portal",
              timestamp: new Date(user.lastLoginAt).toLocaleString(),
              isoTimestamp: user.lastLoginAt,
              ip: "192.168.x.x",
              status: "Success"
            })
          }
        })

        // Process Doctors (Onboarding)
        doctors.forEach(doctor => {
          activities.push({
            id: `doc-create-${doctor.id}`,
            user: "Admin", // Assuming admin adds doctors
            action: "Doctor Onboarded",
            resource: `Dr. ${doctor.name}`,
            timestamp: new Date(doctor.createdAt).toLocaleString(),
            isoTimestamp: doctor.createdAt,
            ip: "192.168.x.x",
            status: "Success"
          })
        })

        // Process Agents (Registration)
        agents.forEach(agent => {
          activities.push({
            id: `agent-create-${agent.id}`,
            user: "Admin",
            action: "Agent Registered",
            resource: agent.name,
            timestamp: new Date(agent.createdAt).toLocaleString(),
            isoTimestamp: agent.createdAt,
            ip: "192.168.x.x",
            status: "Success"
          })
        })

        // Sort by timestamp descending
        activities.sort((a, b) => new Date(b.isoTimestamp).getTime() - new Date(a.isoTimestamp).getTime())

        setLogs(activities)

        // Calculate Stats
        const today = new Date().toISOString().split('T')[0]
        const activeUsers = users.filter(u => u.lastLoginAt && u.lastLoginAt.startsWith(today)).length

        setStats({
          total: activities.length,
          successful: activities.filter(a => a.status === 'Success').length,
          failed: activities.filter(a => a.status === 'Failed').length,
          activeToday: activeUsers
        })

      } catch (error) {
        console.error("Failed to fetch activity logs", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Activity Logs</h1>
            <p className="text-gray-600 mt-1">Monitor aggregated user actions and system activities</p>
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
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-600 mt-1">Aggregated events</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Successful</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.successful}</div>
              <p className="text-xs text-gray-600 mt-1">{(stats.successful / (stats.total || 1) * 100).toFixed(1)}% success rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Failed Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
              <p className="text-xs text-gray-600 mt-1">{(stats.failed / (stats.total || 1) * 100).toFixed(1)}% failure rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Users Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeToday}</div>
              <p className="text-xs text-gray-600 mt-1">Logged in today</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Real-time aggregated activity monitoring</CardDescription>
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
                {logs.slice(0, 50).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.user}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.resource}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {log.timestamp}
                    </TableCell>
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
