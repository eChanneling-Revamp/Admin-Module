"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Hospital, Link2 } from "lucide-react"

const assignments = [
  { doctor: "Dr. Sunil Perera", specialty: "Cardiologist", primaryHospital: "Asiri Colombo", additionalHospitals: ["Nawaloka Colombo", "Oasis Hospital"], totalSessions: 5, status: "Active" },
  { doctor: "Dr. Nimali Fernando", specialty: "Pediatrician", primaryHospital: "Lanka Hospitals", additionalHospitals: ["Durdans Hospital"], totalSessions: 4, status: "Active" },
  { doctor: "Dr. Rohan Wickramasinghe", specialty: "Orthopedic", primaryHospital: "Nawaloka Hospital", additionalHospitals: ["Asiri Kandy"], totalSessions: 3, status: "Active" },
  { doctor: "Dr. Champa Jayawardena", specialty: "Gynecologist", primaryHospital: "Durdans Hospital", additionalHospitals: ["Lanka Hospitals", "Central Hospital"], totalSessions: 6, status: "Active" },
  { doctor: "Dr. Samantha Silva", specialty: "ENT", primaryHospital: "Oasis Hospital", additionalHospitals: [], totalSessions: 3, status: "Active" },
  { doctor: "Dr. Mahesh Rajapaksa", specialty: "Neurologist", primaryHospital: "Lanka Hospitals", additionalHospitals: ["Asiri Colombo"], totalSessions: 4, status: "Active" },
]

export default function DoctorHospitalsPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hospital Assignments</h1>
            <p className="text-gray-600 mt-1">Manage doctor-hospital relationships and sessions</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Link2 className="w-4 h-4 mr-2" />
            Assign Doctor
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">523</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Multi-Hospital Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">142</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Hospitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Weekly Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,847</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Doctor-Hospital Assignments</CardTitle>
            <CardDescription>Overview of doctors practicing at multiple hospitals</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Primary Hospital</TableHead>
                  <TableHead>Additional Hospitals</TableHead>
                  <TableHead>Weekly Sessions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{assignment.doctor}</TableCell>
                    <TableCell>{assignment.specialty}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Hospital className="w-4 h-4 text-blue-600" />
                        {assignment.primaryHospital}
                      </div>
                    </TableCell>
                    <TableCell>
                      {assignment.additionalHospitals.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {assignment.additionalHospitals.map((hospital, i) => (
                            <Badge key={i} variant="outline" className="text-xs w-fit">
                              {hospital}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>{assignment.totalSessions}</TableCell>
                    <TableCell>
                      <Badge variant="default">{assignment.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Manage</Button>
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
