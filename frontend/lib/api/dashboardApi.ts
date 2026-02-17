import type { DashboardStats, ChartDataPoint, ReconciliationData, Notification } from "@/lib/types/dashboard"
import { doctorApi } from "./doctorApi"
import { hospitalApi } from "./hospitalApi"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set')
}

// Types based on the backend response
export interface DashboardStatsResponse {
  users: number
  appointments: number
  doctors: number
  hospitals: number
  revenue: number
  transactions: number
  recentNotifications: {
    id: string
    type: string
    title: string
    message: string
    timestamp: string
    read: boolean
    user: string
  }[]
}

export interface AnalyticsResponse {
  chartData: {
    name: string
    revenue: number
    transactions: number
  }[]
  summary: {
    totalRevenue: number
    totalTransactions: number
  }
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }

      const data = await response.json()
      const stats: DashboardStatsResponse = data.data || data

      // Add changes percentage (mocked for now as backend doesn't provide historical comparison yet)
      const changes = {
        hospitals: 5,
        doctors: 12,
        transactions: 8,
        revenue: 15
      }

      return {
        hospitals: stats.hospitals,
        doctors: stats.doctors,
        transactions: stats.transactions,
        revenue: stats.revenue,
        changes,
      }
    } catch (error) {
      console.error('Dashboard stats error:', error)
      throw error
    }
  },

  getChartData: async (): Promise<ChartDataPoint[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/analytics?timeframe=year`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data = await response.json()
      const analytics: AnalyticsResponse = data.data || data

      // Map backend data to frontend chart format
      return analytics.chartData.map(item => ({
        month: item.name,
        web: item.revenue, // Using 'web' as primary revenue metric for the chart
        telco: item.transactions * 100, // visualizing transactions on same scale
        agent: item.revenue * 0.4 // Mock split
      }))
    } catch (error) {
      console.error('Chart data error:', error)
      // Fallback to empty data to prevent crash
      return []
    }
  },

  getReconciliationData: async (): Promise<ReconciliationData[]> => {
    // This endpoint wasn't in the original backend service, keep as is or connect to invoices stats if appropriate
    // Connecting to invoice stats as a proxy for reconciliation status
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/invoices/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const stats = data.data || data
        return [
          { name: "Reconciled", value: stats.paid || 0, color: "#22C55E" }, // Paid as Reconciled
          { name: "Pending", value: stats.pending || 0, color: "#F59E0B" },
          { name: "Failed", value: 0, color: "#EF4444" }, // No failed status in invoice stats yet
        ]
      }
      throw new Error('Failed to fetch invoice stats')
    } catch (error) {
      console.error('Reconciliation data error', error)
      return [
        { name: "Reconciled", value: 0, color: "#22C55E" },
        { name: "Pending", value: 0, color: "#F59E0B" },
        { name: "Failed", value: 0, color: "#EF4444" },
      ]
    }
  },

  getNotifications: async (): Promise<Notification[]> => {
    try {
      // Use the generic stats endpoint which includes recent notifications
      // effectively getting 2-in-1, or call specific notification endpoint
      // Let's call the generic stats endpoint again or better, just reuse the logic if we already fetched it.
      // But typically this is called separately.

      const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      const stats: DashboardStatsResponse = data.data || data

      return stats.recentNotifications.map(n => ({
        id: n.id,
        type: n.type as any, // assuming type matches or needs mapping
        title: n.title,
        message: n.message,
        timestamp: new Date(n.timestamp),
        read: n.read,
        icon: n.type === 'alert' || n.type === 'error' ? 'AlertCircle' :
          n.type === 'success' ? 'CheckCircle' : 'Info'
      }))
    } catch (error) {
      console.error('Notifications error:', error)
      return []
    }
  },

  getRecentActivity: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/recent-activity?limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recent activity')
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error('Recent activity error:', error)
      return []
    }
  },
}
