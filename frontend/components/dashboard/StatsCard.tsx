"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  icon: React.ReactNode
  iconBg: string
  title: string
  value: string | number
  comparison: number
  comparisonType: "increase" | "decrease"
  label: string
}

export function StatsCard({ icon, iconBg, title, value, comparison, comparisonType, label }: StatsCardProps) {
  const isPositive = comparisonType === "increase"

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconBg)}>{icon}</div>
          <div className={cn("flex items-center gap-1 text-sm", isPositive ? "text-green-600" : "text-red-600")}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="font-medium">
              {isPositive ? "+" : ""}
              {comparison}
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-2">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
