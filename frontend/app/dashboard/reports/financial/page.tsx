"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Download, FileText, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const reportTypes = [
  { 
    title: "Revenue Report", 
    description: "Comprehensive financial performance and revenue breakdown",
    lastGenerated: "Oct 30, 2025",
    frequency: "Daily",
    icon: TrendingUp,
    color: "bg-green-100 text-green-600"
  },
  { 
    title: "Hospital Performance", 
    description: "Individual hospital statistics and booking trends",
    lastGenerated: "Oct 29, 2025",
    frequency: "Weekly",
    icon: BarChart,
    color: "bg-blue-100 text-blue-600"
  },
  { 
    title: "Doctor Analytics", 
    description: "Doctor performance metrics and patient satisfaction",
    lastGenerated: "Oct 28, 2025",
    frequency: "Weekly",
    icon: FileText,
    color: "bg-purple-100 text-purple-600"
  },
  { 
    title: "Agent Commission", 
    description: "Agent earnings and commission breakdown",
    lastGenerated: "Oct 30, 2025",
    frequency: "Monthly",
    icon: FileText,
    color: "bg-orange-100 text-orange-600"
  },
]

export default function FinancialReportsPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600 mt-1">Generate and download financial analytics</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export All Reports
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">LKR 12.5M</div>
              <p className="text-xs text-green-600 mt-1">+18% vs last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">4,567</div>
              <p className="text-xs text-gray-600 mt-1">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Platform Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">LKR 890K</div>
              <p className="text-xs text-gray-600 mt-1">Collected</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Agent Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">LKR 687K</div>
              <p className="text-xs text-gray-600 mt-1">Paid out</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((report, idx) => {
            const Icon = report.icon
            return (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${report.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="mt-1">{report.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Generated:</span>
                    <span className="font-medium">{report.lastGenerated}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Frequency:</span>
                    <Badge variant="outline">{report.frequency}</Badge>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      View Report
                    </Button>
                    <Button className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown by Category</CardTitle>
            <CardDescription>October 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: "Consultation Fees", amount: "LKR 8.2M", percentage: 66, color: "bg-blue-500" },
                { category: "Platform Fees", amount: "LKR 890K", percentage: 7, color: "bg-green-500" },
                { category: "Follow-up Consultations", amount: "LKR 2.1M", percentage: 17, color: "bg-purple-500" },
                { category: "Corporate Accounts", amount: "LKR 1.3M", percentage: 10, color: "bg-orange-500" },
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-gray-600">{item.amount} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
