"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp } from "lucide-react"

const commissionsData = [
  { id: 1, agentType: "Telco Agents", rate: "5.0%", totalEarned: "LKR 5.9M", bookings: 3010, avgPerBooking: "LKR 1,960", status: "Active" },
  { id: 2, agentType: "Corporate Agents", rate: "5.5%", totalEarned: "LKR 6.7M", bookings: 3010, avgPerBooking: "LKR 2,227", status: "Active" },
  { id: 3, agentType: "Individual Agents", rate: "8.0%", totalEarned: "LKR 448K", bookings: 223, avgPerBooking: "LKR 2,009", status: "Active" },
  { id: 4, agentType: "Insurance Partners", rate: "6.0%", totalEarned: "LKR 3.2M", bookings: 1450, avgPerBooking: "LKR 2,207", status: "Active" },
  { id: 5, agentType: "Bank Partners", rate: "4.5%", totalEarned: "LKR 2.1M", bookings: 870, avgPerBooking: "LKR 2,414", status: "Active" },
]

export default function CommissionsPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Commission Settings</h1>
            <p className="text-gray-600 mt-1">Manage agent commission rates and payouts</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <DollarSign className="w-4 h-4 mr-2" />
            Adjust Rates
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">LKR 18.3M</div>
              <p className="text-xs text-gray-600 mt-1">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">LKR 4.2M</div>
              <p className="text-xs text-gray-600 mt-1">Due this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Paid Out</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">LKR 14.1M</div>
              <p className="text-xs text-gray-600 mt-1">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Commission Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5.8%</div>
              <p className="text-xs text-gray-600 mt-1">Across all agents</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Commission Structure by Agent Type</CardTitle>
            <CardDescription>Current commission rates and earnings breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent Type</TableHead>
                  <TableHead>Commission Rate</TableHead>
                  <TableHead>Total Earned</TableHead>
                  <TableHead>Total Bookings</TableHead>
                  <TableHead>Avg Per Booking</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissionsData.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell className="font-medium">{commission.agentType}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-blue-600 border-blue-300">
                          {commission.rate}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">{commission.totalEarned}</TableCell>
                    <TableCell>{commission.bookings.toLocaleString()}</TableCell>
                    <TableCell className="text-gray-600">{commission.avgPerBooking}</TableCell>
                    <TableCell>
                      <Badge variant="default">{commission.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Edit Rate</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payouts</CardTitle>
              <CardDescription>Latest commission payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { agent: "Dialog Axiata", amount: "LKR 125,000", date: "Oct 28, 2025" },
                  { agent: "Softlogic Health", amount: "LKR 192,000", date: "Oct 27, 2025" },
                  { agent: "Ceylinco Insurance", amount: "LKR 115,500", date: "Oct 26, 2025" },
                ].map((payout, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <div className="font-medium">{payout.agent}</div>
                      <div className="text-sm text-gray-600">{payout.date}</div>
                    </div>
                    <div className="text-green-600 font-semibold">{payout.amount}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Earning Agents</CardTitle>
              <CardDescription>This month's leaders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { rank: 1, agent: "Softlogic Health", commission: "LKR 320,000" },
                  { rank: 2, agent: "Dialog Axiata", commission: "LKR 250,000" },
                  { rank: 3, agent: "Ceylinco Insurance", commission: "LKR 210,000" },
                ].map((top) => (
                  <div key={top.rank} className="flex justify-between items-center border-b pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                        {top.rank}
                      </div>
                      <div className="font-medium">{top.agent}</div>
                    </div>
                    <div className="text-blue-600 font-semibold">{top.commission}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
