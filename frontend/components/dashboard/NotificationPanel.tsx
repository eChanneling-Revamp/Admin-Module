"use client"

import { AlertCircle, CheckCircle, AlertTriangle, Bell, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Notification } from "@/lib/types/dashboard"

interface NotificationPanelProps {
  notifications: Notification[]
}

const iconMap = {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Bell,
  Info,
}

const typeColors = {
  alert: "text-orange-600 bg-orange-50",
  success: "text-green-600 bg-green-50",
  error: "text-red-600 bg-red-50",
  info: "text-blue-600 bg-blue-50",
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  if (diffDays === 1) return "1 day ago"
  return `${diffDays} days ago`
}

export function NotificationPanel({ notifications }: NotificationPanelProps) {
  // Ensure notifications is always an array
  const safeNotifications = Array.isArray(notifications) ? notifications : []
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {safeNotifications.map((notification) => {
            const IconComponent = iconMap[notification.icon as keyof typeof iconMap] || Bell
            return (
              <div
                key={notification.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-gray-50",
                  !notification.read && "bg-blue-50/50 border-blue-200",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    typeColors[notification.type],
                  )}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    {!notification.read && <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatTimestamp(notification.timestamp)}</p>
                </div>
              </div>
            )
          })}
        </div>
        <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All Notifications
        </button>
      </CardContent>
    </Card>
  )
}
