"use client"

import { useEffect, useState } from "react"
import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { BarChart } from "@/components/dashboard/BarChart"
import { PieChart } from "@/components/dashboard/PieChart"
import { NotificationPanel } from "@/components/dashboard/NotificationPanel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Users, Receipt, DollarSign, RotateCw } from "lucide-react"
import { dashboardApi } from "@/lib/api/dashboardApi"
import type { DashboardStats, ChartDataPoint, ReconciliationData, Notification } from "@/lib/types/dashboard"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [reconciliationData, setReconciliationData] = useState<ReconciliationData[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsData, chartDataRes, reconciliationDataRes, notificationsData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getChartData(),
        dashboardApi.getReconciliationData(),
        dashboardApi.getNotifications(),
      ])

      setStats(statsData)
      setChartData(chartDataRes)
      setReconciliationData(reconciliationDataRes)
      setNotifications(notificationsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = () => {
    toast({
      title: "Refreshing",
      description: "Loading latest data...",
    })
    loadData()
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-cyan-600" />
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Welcome to eChannelling Admin Portal</p>
          </div>
          <Button onClick={handleRefresh} className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white shadow-md" size="sm">
            <RotateCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              icon={<Building2 className="w-6 h-6 text-white" />}
              iconBg="bg-blue-500"
              title="Hospitals"
              value={stats.hospitals}
              comparison={stats.changes.hospitals}
              comparisonType="increase"
              label="from last month"
            />
            <StatsCard
              icon={<Users className="w-6 h-6 text-white" />}
              iconBg="bg-green-500"
              title="Doctors"
              value={stats.doctors}
              comparison={stats.changes.doctors}
              comparisonType="increase"
              label="from last month"
            />
            <StatsCard
              icon={<Receipt className="w-6 h-6 text-white" />}
              iconBg="bg-purple-500"
              title="Transactions"
              value={stats.transactions.toLocaleString()}
              comparison={stats.changes.transactions}
              comparisonType="increase"
              label="from last month"
            />
            <StatsCard
              icon={<DollarSign className="w-6 h-6 text-white" />}
              iconBg="bg-orange-500"
              title="Revenue"
              value={`LKR ${(stats.revenue / 1000000).toFixed(1)}M`}
              comparison={18}
              comparisonType="increase"
              label="from last month"
            />
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Fees & Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart data={chartData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Reconciliation Status</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart data={reconciliationData} />
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <NotificationPanel notifications={notifications} />
      </div>
    </ProtectedLayout>
  )
}
