"use client"

import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { ReconciliationData } from "@/lib/types/dashboard"

interface PieChartProps {
  data: ReconciliationData[]
}

export function PieChart({ data }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        />
        <Legend />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-gray-900">
          {total.toLocaleString()}
        </text>
        <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="text-xs fill-gray-500" dy={15}>
          Total
        </text>
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}
