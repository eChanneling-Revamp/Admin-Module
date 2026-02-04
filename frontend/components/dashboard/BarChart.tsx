"use client"

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { ChartDataPoint } from "@/lib/types/dashboard"

interface BarChartProps {
  data: ChartDataPoint[]
}

export function BarChart({ data }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        />
        <Legend wrapperStyle={{ paddingTop: "20px" }} />
        <Bar dataKey="web" fill="#3b82f6" name="Web" radius={[4, 4, 0, 0]} />
        <Bar dataKey="telco" fill="#22c55e" name="Telco" radius={[4, 4, 0, 0]} />
        <Bar dataKey="agent" fill="#f97316" name="Agent" radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
