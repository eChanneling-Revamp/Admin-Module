"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tag, Plus } from "lucide-react"

const discountsData = [
  { code: "NEWUSER25", discount: "25%", maxDiscount: "LKR 500", usageCount: 1247, validUntil: "Dec 31, 2025", status: "Active", type: "New User" },
  { code: "SENIOR15", discount: "15%", maxDiscount: "LKR 300", usageCount: 543, validUntil: "Ongoing", status: "Active", type: "Senior Citizen" },
  { code: "FIRSTVISIT", discount: "LKR 200", maxDiscount: "LKR 200", usageCount: 892, validUntil: "Ongoing", status: "Active", type: "Flat Discount" },
  { code: "WEEKEND10", discount: "10%", maxDiscount: "LKR 250", usageCount: 678, validUntil: "Nov 30, 2025", status: "Active", type: "Weekend Special" },
  { code: "LOYALTY20", discount: "20%", maxDiscount: "LKR 400", usageCount: 234, validUntil: "Ongoing", status: "Active", type: "Loyalty" },
  { code: "CORPORATE15", discount: "15%", maxDiscount: "LKR 350", usageCount: 1567, validUntil: "Ongoing", status: "Active", type: "Corporate" },
  { code: "DIWALI30", discount: "30%", maxDiscount: "LKR 600", usageCount: 89, validUntil: "Nov 15, 2025", status: "Expired", type: "Festival" },
]

export default function DiscountsPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discount Codes</h1>
            <p className="text-gray-600 mt-1">Manage promotional codes and special offers</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Discount Code
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{discountsData.filter(d => d.status === "Active").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Redemptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{discountsData.reduce((acc, d) => acc + d.usageCount, 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">LKR 1.8M</div>
              <p className="text-xs text-gray-600 mt-1">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Most Popular</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">CORPORATE15</div>
              <p className="text-xs text-gray-600 mt-1">1,567 uses</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Discount Codes</CardTitle>
            <CardDescription>Active and expired promotional codes</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Max Discount</TableHead>
                  <TableHead>Usage Count</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discountsData.map((discount, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono font-bold">{discount.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{discount.type}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">{discount.discount}</TableCell>
                    <TableCell className="text-gray-600">{discount.maxDiscount}</TableCell>
                    <TableCell>{discount.usageCount.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{discount.validUntil}</TableCell>
                    <TableCell>
                      <Badge variant={discount.status === "Active" ? "default" : "secondary"}>
                        {discount.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Edit</Button>
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
