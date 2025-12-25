export interface DashboardStats {
  hospitals: number
  doctors: number
  transactions: number
  revenue: number
  changes: {
    hospitals: number
    doctors: number
    transactions: number
    revenue: number
  }
}

export interface ChartDataPoint {
  month: string
  web: number
  telco: number
  agent: number
}

export interface ReconciliationData {
  name: string
  value: number
  color: string
}

export type NotificationType = "alert" | "success" | "error" | "info"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
  icon: string
}
