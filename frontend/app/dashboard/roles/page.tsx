"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Shield, RefreshCcw, Loader2 } from "lucide-react"

import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { userApi, type User, type UserStats } from "@/lib/api/userApi"

const KNOWN_ROLES = ["ADMIN", "SUPERVISOR", "AGENT", "CORPORATE", "PATIENT"] as const
type KnownRole = (typeof KNOWN_ROLES)[number]

interface RoleTheme {
  accent: string
  emblem: string
  chip: string
  border: string
}

interface RoleTemplate {
  title: string
  description: string
  permissions: string[]
  theme: RoleTheme
}

interface RoleSummary {
  role: string
  title: string
  description: string
  permissions: string[]
  theme: RoleTheme
  userCount: number
  activeUsers: number
  inactiveUsers: number
  sampleUsers: string[]
  lastUpdated: string | null
  isCustom: boolean
}

const ROLE_LIBRARY: Record<KnownRole | "default", RoleTemplate> = {
  ADMIN: {
    title: "Super Admin",
    description: "Complete control across every module and integration.",
    permissions: [
      "Full system visibility",
      "User & role lifecycle",
      "Billing + payouts",
      "Audit log oversight",
    ],
    theme: {
      accent: "text-blue-600",
      emblem: "bg-blue-50 text-blue-700",
      chip: "border-blue-200 bg-blue-50 text-blue-700",
      border: "border-blue-200/70",
    },
  },
  SUPERVISOR: {
    title: "Operations Supervisor",
    description: "Coordinates hospitals, doctors, and escalations.",
    permissions: [
      "Hospital directory management",
      "Doctor scheduling",
      "Dashboard insights",
      "Escalation handling",
    ],
    theme: {
      accent: "text-emerald-600",
      emblem: "bg-emerald-50 text-emerald-700",
      chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
      border: "border-emerald-200/70",
    },
  },
  AGENT: {
    title: "Agent Manager",
    description: "Owns agent onboarding, commissions, and bookings.",
    permissions: [
      "Agent roster management",
      "Commission configuration",
      "Booking oversight",
      "Collections tracking",
    ],
    theme: {
      accent: "text-amber-600",
      emblem: "bg-amber-50 text-amber-700",
      chip: "border-amber-200 bg-amber-50 text-amber-700",
      border: "border-amber-200/70",
    },
  },
  CORPORATE: {
    title: "Corporate Partner",
    description: "Controls enterprise packages and invoicing flows.",
    permissions: [
      "Employee enrollment",
      "Package utilization",
      "Invoice approvals",
      "Partner analytics",
    ],
    theme: {
      accent: "text-violet-600",
      emblem: "bg-violet-50 text-violet-700",
      chip: "border-violet-200 bg-violet-50 text-violet-700",
      border: "border-violet-200/70",
    },
  },
  PATIENT: {
    title: "Patient Portal",
    description: "Self-service experience for bookings and records.",
    permissions: [
      "Book & reschedule",
      "View medical history",
      "Download invoices",
      "Receive notifications",
    ],
    theme: {
      accent: "text-slate-600",
      emblem: "bg-slate-50 text-slate-700",
      chip: "border-slate-200 bg-slate-50 text-slate-700",
      border: "border-slate-200/70",
    },
  },
  default: {
    title: "Custom Role",
    description: "Synced from the core platform with tailored scopes.",
    permissions: [
      "Backend-managed entitlements",
      "Resource access defined per assignment",
    ],
    theme: {
      accent: "text-gray-600",
      emblem: "bg-gray-50 text-gray-700",
      chip: "border-gray-200 bg-white text-gray-700",
      border: "border-gray-200",
    },
  },
}

const isKnownRole = (role: string): role is KnownRole =>
  KNOWN_ROLES.includes(role as KnownRole)

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

const formatRelativeTime = (timestamp: string | null): string => {
  if (!timestamp) {
    return "No updates yet"
  }

  const parsed = new Date(timestamp).getTime()
  if (!Number.isFinite(parsed)) {
    return "No updates yet"
  }

  const diffMinutes = Math.round((parsed - Date.now()) / 60000)
  if (Math.abs(diffMinutes) < 1) {
    return "Just now"
  }

  if (Math.abs(diffMinutes) < 60) {
    return relativeTimeFormatter.format(diffMinutes, "minute")
  }

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) {
    return relativeTimeFormatter.format(diffHours, "hour")
  }

  const diffDays = Math.round(diffHours / 24)
  return relativeTimeFormatter.format(diffDays, "day")
}

const buildRoleSummaries = (users: User[], stats: UserStats | null): RoleSummary[] => {
  type Accumulator = {
    total: number
    active: number
    sampleUsers: string[]
    lastUpdated: string | null
  }

  const map = new Map<string, Accumulator>()

  users.forEach((user) => {
    const current = map.get(user.role) ?? {
      total: 0,
      active: 0,
      sampleUsers: [],
      lastUpdated: null,
    }

    const updatedAt = current.lastUpdated
    const shouldReplaceTimestamp = !updatedAt || new Date(user.updatedAt) > new Date(updatedAt)

    const updated: Accumulator = {
      total: current.total + 1,
      active: current.active + (user.isActive ? 1 : 0),
      sampleUsers:
        current.sampleUsers.length < 3
          ? [...current.sampleUsers, user.name || user.email]
          : current.sampleUsers,
      lastUpdated: shouldReplaceTimestamp ? user.updatedAt : current.lastUpdated,
    }

    map.set(user.role, updated)
  })

  const roleKeys = new Set<string>([
    ...map.keys(),
    ...Object.keys(stats?.byRole ?? {}),
  ])

  return Array.from(roleKeys)
    .map((role) => {
      const template = isKnownRole(role) ? ROLE_LIBRARY[role] : ROLE_LIBRARY.default
      const accumulator = map.get(role)
      const totalUsers = stats?.byRole?.[role] ?? accumulator?.total ?? 0
      const activeUsers = accumulator?.active ?? 0
      const inactiveUsers = Math.max(totalUsers - activeUsers, 0)

      return {
        role,
        title: template.title,
        description: template.description,
        permissions: template.permissions,
        theme: template.theme,
        userCount: totalUsers,
        activeUsers,
        inactiveUsers,
        sampleUsers: accumulator?.sampleUsers ?? [],
        lastUpdated: accumulator?.lastUpdated ?? null,
        isCustom: !isKnownRole(role),
      }
    })
    .sort((a, b) => b.userCount - a.userCount)
}

export default function RolesPage() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  const fetchRoleData = useCallback(async () => {
    setStatus("loading")
    setErrorMessage("")

    try {
      const [userResponse, statsResponse] = await Promise.all([
        userApi.getAll({ page: 1, limit: 200, sortBy: "name", sortOrder: "asc" }),
        userApi.getStats(),
      ])

      setUsers(userResponse.users)
      setStats(statsResponse)
      setStatus("idle")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load roles")
      setStatus("error")
    }
  }, [])

  useEffect(() => {
    void fetchRoleData()
  }, [fetchRoleData])

  const roleSummaries = useMemo(() => buildRoleSummaries(users, stats), [users, stats])
  const activeRoleCount = useMemo(
    () => roleSummaries.filter((role) => role.activeUsers > 0).length,
    [roleSummaries]
  )
  const customRoleCount = useMemo(
    () => roleSummaries.filter((role) => role.isCustom).length,
    [roleSummaries]
  )

  const metrics = useMemo(
    () => [
      {
        label: "Total Roles",
        value: roleSummaries.length,
        description: "Unique access tiers in use",
      },
      {
        label: "Total Users",
        value: stats?.total ?? 0,
        description: `${stats?.recentLogins ?? 0} logins in the last 30 days`,
      },
      {
        label: "Active Roles",
        value: activeRoleCount,
        description: "Roles with at least one active member",
      },
      {
        label: "Custom Roles",
        value: customRoleCount,
        description: "Outside the default catalog",
      },
    ],
    [roleSummaries.length, stats, activeRoleCount, customRoleCount]
  )

  const showSkeleton = status === "loading" && roleSummaries.length === 0
  const showEmptyState = status === "idle" && roleSummaries.length === 0

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roles & Privileges</h1>
            <p className="text-gray-600 mt-1">
              Live breakdown of user access tiers from the admin API.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {status === "loading" && roleSummaries.length > 0 && (
              <span className="text-sm text-gray-500">Refreshing data…</span>
            )}
            <Button
              variant="outline"
              onClick={() => void fetchRoleData()}
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4" />
              )}
              Refresh data
            </Button>
          </div>
        </div>

        {status === "error" && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Unable to load roles</CardTitle>
              <CardDescription className="text-red-700">
                {errorMessage || "Please verify the API connection and try again."}
              </CardDescription>
              <Button
                variant="outline"
                className="mt-4 border-red-200 text-red-700 hover:bg-red-100"
                onClick={() => void fetchRoleData()}
              >
                Retry
              </Button>
            </CardHeader>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.label}
                </CardTitle>
                <CardDescription>{metric.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Roles</CardTitle>
            <CardDescription>
              {stats?.recentLogins ?? 0} active logins recorded over the last 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showSkeleton && (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 animate-pulse bg-white"
                  >
                    <div className="h-5 w-1/3 rounded bg-gray-100" />
                    <div className="mt-3 h-4 w-2/3 rounded bg-gray-100" />
                    <div className="mt-4 flex gap-2">
                      {Array.from({ length: 3 }).map((__, chipIndex) => (
                        <div key={chipIndex} className="h-6 w-20 rounded-full bg-gray-100" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showEmptyState && (
              <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center">
                <p className="text-gray-700 font-semibold">No roles available</p>
                <p className="text-sm text-gray-500 mt-1">
                  Create users in the backend to see their roles and privileges here.
                </p>
              </div>
            )}

            {!showSkeleton && roleSummaries.length > 0 && (
              <div className="space-y-4">
                {roleSummaries.map((role) => (
                  <div
                    key={role.role}
                    className={`rounded-lg border p-4 transition-colors hover:border-blue-400 ${role.theme.border}`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex flex-1 items-start gap-3">
                        <span className={`rounded-full p-2 ${role.theme.emblem}`}>
                          <Shield className={`h-5 w-5 ${role.theme.accent}`} />
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">{role.title}</h3>
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                              {role.role}
                            </Badge>
                            {role.isCustom && (
                              <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">
                                Custom
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {role.permissions.map((permission) => (
                              <Badge
                                key={`${role.role}-${permission}`}
                                variant="outline"
                                className={`text-xs ${role.theme.chip}`}
                              >
                                {permission}
                              </Badge>
                            ))}
                          </div>
                          {role.sampleUsers.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                              {role.sampleUsers.map((name) => (
                                <Badge
                                  key={`${role.role}-${name}`}
                                  variant="secondary"
                                  className="bg-white text-gray-700 border border-dashed border-gray-200"
                                >
                                  {name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className={`text-2xl font-bold ${role.theme.accent}`}>
                          {role.userCount}
                        </div>
                        <span className="text-xs uppercase tracking-wide text-gray-500">users</span>
                        <div className="mt-2 grid grid-cols-2 gap-3 text-right text-sm">
                          <div>
                            <p className="text-gray-500">Active</p>
                            <p className="font-semibold text-emerald-600">{role.activeUsers}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Inactive</p>
                            <p className="font-semibold text-amber-600">{role.inactiveUsers}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-500">Last update</p>
                            <p className="text-sm font-medium text-gray-700">
                              {formatRelativeTime(role.lastUpdated)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
