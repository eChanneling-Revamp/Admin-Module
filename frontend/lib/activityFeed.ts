"use client"

import { agentApi } from "@/lib/api/agentApi"
import { doctorApi } from "@/lib/api/doctorApi"
import { userApi } from "@/lib/api/userApi"

export interface ActivityLog {
  id: string
  user: string
  action: string
  resource: string
  timestamp: string
  isoTimestamp: string
  ip: string
  status: "Success" | "Failed"
}

export interface ActivityStats {
  total: number
  successful: number
  failed: number
  activeToday: number
}

export interface ActivityFeedData {
  activities: ActivityLog[]
  stats: ActivityStats
}

export interface TopBarNotification {
  id: string
  title: string
  message: string
  time: string
  type: "success" | "warning" | "info"
}

const formatRelativeTime = (isoTimestamp: string) => {
  const now = Date.now()
  const target = new Date(isoTimestamp).getTime()
  const diffMs = Math.max(0, now - target)
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`

  return new Date(isoTimestamp).toLocaleDateString()
}

export const fetchActivityFeed = async (): Promise<ActivityFeedData> => {
  const [usersData, doctors, agentsData] = await Promise.all([
    userApi.getAll({ limit: 100, sortOrder: "desc", sortBy: "createdAt" }),
    doctorApi.getAll(),
    agentApi.getAll({ limit: 100, sortOrder: "desc", sortBy: "createdAt" }),
  ])

  const users = usersData.users
  const agents = agentsData.agents

  const activities: ActivityLog[] = []

  users.forEach((user) => {
    activities.push({
      id: `user-create-${user.id}`,
      user: user.name || user.email,
      action: "User Registered",
      resource: "System",
      timestamp: new Date(user.createdAt).toLocaleString(),
      isoTimestamp: user.createdAt,
      ip: "192.168.x.x",
      status: "Success",
    })

    if (user.lastLoginAt) {
      activities.push({
        id: `user-login-${user.id}`,
        user: user.name || user.email,
        action: "User Login",
        resource: "Admin Portal",
        timestamp: new Date(user.lastLoginAt).toLocaleString(),
        isoTimestamp: user.lastLoginAt,
        ip: "192.168.x.x",
        status: "Success",
      })
    }
  })

  doctors.forEach((doctor) => {
    activities.push({
      id: `doc-create-${doctor.id}`,
      user: "Admin",
      action: "Doctor Onboarded",
      resource: `Dr. ${doctor.name}`,
      timestamp: new Date(doctor.createdAt).toLocaleString(),
      isoTimestamp: doctor.createdAt,
      ip: "192.168.x.x",
      status: "Success",
    })
  })

  agents.forEach((agent) => {
    activities.push({
      id: `agent-create-${agent.id}`,
      user: "Admin",
      action: "Agent Registered",
      resource: agent.name,
      timestamp: new Date(agent.createdAt).toLocaleString(),
      isoTimestamp: agent.createdAt,
      ip: "192.168.x.x",
      status: "Success",
    })
  })

  activities.sort((a, b) => new Date(b.isoTimestamp).getTime() - new Date(a.isoTimestamp).getTime())

  const today = new Date().toISOString().split("T")[0]
  const activeUsers = users.filter((user) => user.lastLoginAt && user.lastLoginAt.startsWith(today)).length

  return {
    activities,
    stats: {
      total: activities.length,
      successful: activities.filter((activity) => activity.status === "Success").length,
      failed: activities.filter((activity) => activity.status === "Failed").length,
      activeToday: activeUsers,
    },
  }
}

export const mapActivitiesToNotifications = (activities: ActivityLog[]): TopBarNotification[] =>
  activities.slice(0, 8).map((activity) => ({
    id: activity.id,
    title: activity.action,
    message: `${activity.user} - ${activity.resource}`,
    time: formatRelativeTime(activity.isoTimestamp),
    type:
      activity.status === "Failed"
        ? "warning"
        : activity.action.includes("Registered") || activity.action.includes("Onboarded")
          ? "success"
          : "info",
  }))
