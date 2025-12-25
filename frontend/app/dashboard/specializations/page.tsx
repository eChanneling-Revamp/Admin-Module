"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Stethoscope, Users, TrendingUp } from "lucide-react"

const specializationsData = [
  { name: "Cardiology", doctors: 45, patients: 1250, revenue: "LKR 12.5M", growth: "+12%" },
  { name: "Pediatrics", doctors: 38, patients: 2100, revenue: "LKR 8.3M", growth: "+15%" },
  { name: "Orthopedics", doctors: 32, patients: 980, revenue: "LKR 9.2M", growth: "+8%" },
  { name: "Gynecology", doctors: 28, patients: 1560, revenue: "LKR 7.8M", growth: "+10%" },
  { name: "ENT", doctors: 22, patients: 890, revenue: "LKR 4.5M", growth: "+5%" },
  { name: "Dermatology", doctors: 25, patients: 1780, revenue: "LKR 6.2M", growth: "+18%" },
  { name: "Neurology", doctors: 18, patients: 650, revenue: "LKR 8.9M", growth: "+7%" },
  { name: "Ophthalmology", doctors: 20, patients: 1320, revenue: "LKR 5.6M", growth: "+14%" },
  { name: "Gastroenterology", doctors: 15, patients: 540, revenue: "LKR 4.2M", growth: "+6%" },
  { name: "General Surgery", doctors: 35, patients: 780, revenue: "LKR 11.3M", growth: "+9%" },
]

export default function SpecializationsPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medical Specializations</h1>
            <p className="text-gray-600 mt-1">Overview of medical specialties and performance</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Add Specialization
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Specializations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{specializationsData.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{specializationsData.reduce((acc, s) => acc + s.doctors, 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{specializationsData.reduce((acc, s) => acc + s.patients, 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">+10.4%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {specializationsData.map((spec, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{spec.name}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-green-600 border-green-300">
                        {spec.growth}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{spec.doctors}</div>
                    <div className="text-xs text-gray-600">Doctors</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{spec.patients}</div>
                    <div className="text-xs text-gray-600">Patients</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">{spec.revenue}</div>
                    <div className="text-xs text-gray-600">Revenue</div>
                  </div>
                </div>
                <Button className="w-full" variant="outline">View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
