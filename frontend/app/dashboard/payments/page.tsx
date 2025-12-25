"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, CreditCard } from "lucide-react"

const paymentsData = [
  { id: 1, txnId: "TXN-2025-8847", patient: "Kasun Perera", amount: "LKR 2,700", method: "Card", hospital: "Asiri Colombo", date: "Oct 30, 14:35", status: "Success" },
  { id: 2, txnId: "TXN-2025-8846", patient: "Nimali Fernando", amount: "LKR 3,100", method: "Dialog App", hospital: "Lanka Hospitals", date: "Oct 30, 13:20", status: "Success" },
  { id: 3, txnId: "TXN-2025-8845", patient: "Rohan Silva", amount: "LKR 2,400", method: "Bank Transfer", hospital: "Nawaloka", date: "Oct 30, 12:15", status: "Success" },
  { id: 4, txnId: "TXN-2025-8844", patient: "Champa De Silva", amount: "LKR 2,900", method: "Card", hospital: "Durdans", date: "Oct 30, 11:45", status: "Failed" },
  { id: 5, txnId: "TXN-2025-8843", patient: "Samantha Wickrama", amount: "LKR 2,200", method: "Mobitel App", hospital: "Oasis Hospital", date: "Oct 30, 10:30", status: "Success" },
  { id: 6, txnId: "TXN-2025-8842", patient: "Priyanka Gunawardena", amount: "LKR 2,600", method: "Card", hospital: "Central Hospital", date: "Oct 30, 09:50", status: "Success" },
  { id: 7, txnId: "TXN-2025-8841", patient: "Mahesh Rajapaksa", amount: "LKR 3,400", method: "Corporate Credit", hospital: "Lanka Hospitals", date: "Oct 30, 09:15", status: "Success" },
]

export default function PaymentsPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Transactions</h1>
            <p className="text-gray-600 mt-1">Monitor all payment activities and transactions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              View Analytics
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Today's Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">LKR 342K</div>
              <p className="text-xs text-green-600 mt-1">+12.5% vs yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,247</div>
              <p className="text-xs text-gray-600 mt-1">Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">98.2%</div>
              <p className="text-xs text-gray-600 mt-1">1,225 successful</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">22</div>
              <p className="text-xs text-gray-600 mt-1">Need attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">LKR 2,740</div>
              <p className="text-xs text-gray-600 mt-1">Per booking</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest payment activities across the platform</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search transactions..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsData.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm">{payment.txnId}</TableCell>
                    <TableCell className="font-medium">{payment.patient}</TableCell>
                    <TableCell className="font-semibold">{payment.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.method}</Badge>
                    </TableCell>
                    <TableCell>{payment.hospital}</TableCell>
                    <TableCell className="text-sm text-gray-600">{payment.date}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === "Success" ? "default" : "destructive"}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
