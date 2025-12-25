"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"

const schedules = [
  { doctor: "Dr. Sunil Perera", specialty: "Cardiologist", hospital: "Asiri Colombo", day: "Monday", time: "09:00 AM - 12:00 PM", slots: 12, booked: 10, status: "Active" },
  { doctor: "Dr. Nimali Fernando", specialty: "Pediatrician", hospital: "Lanka Hospitals", day: "Monday", time: "02:00 PM - 05:00 PM", slots: 15, booked: 15, status: "Full" },
  { doctor: "Dr. Rohan Wickramasinghe", specialty: "Orthopedic", hospital: "Nawaloka", day: "Tuesday", time: "08:00 AM - 11:00 AM", slots: 10, booked: 7, status: "Active" },
  { doctor: "Dr. Champa Jayawardena", specialty: "Gynecologist", hospital: "Durdans", day: "Tuesday", time: "03:00 PM - 06:00 PM", slots: 12, booked: 9, status: "Active" },
  { doctor: "Dr. Samantha Silva", specialty: "ENT", hospital: "Oasis Hospital", day: "Wednesday", time: "10:00 AM - 01:00 PM", slots: 14, booked: 12, status: "Active" },
  { doctor: "Dr. Mahesh Rajapaksa", specialty: "Neurologist", hospital: "Lanka Hospitals", day: "Thursday", time: "09:00 AM - 12:00 PM", slots: 8, booked: 8, status: "Full" },
  { doctor: "Dr. Sanduni De Silva", specialty: "Ophthalmologist", hospital: "Central Hospital", day: "Friday", time: "02:00 PM - 05:00 PM", slots: 16, booked: 11, status: "Active" },
]

export default function DoctorSchedulesPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Schedules</h1>
            <p className="text-gray-600 mt-1">Manage appointment schedules and availability</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Calendar className="w-4 h-4 mr-2" />
            Create Schedule
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">287</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Today's Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">45</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Available Slots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,243</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Booking Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">87%</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>This Week's Schedule</CardTitle>
            <CardDescription>Active doctor schedules and appointment availability</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Slots</TableHead>
                  <TableHead>Booked</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{schedule.doctor}</TableCell>
                    <TableCell>{schedule.specialty}</TableCell>
                    <TableCell>{schedule.hospital}</TableCell>
                    <TableCell>{schedule.day}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {schedule.time}
                      </div>
                    </TableCell>
                    <TableCell>{schedule.slots}</TableCell>
                    <TableCell>{schedule.booked}</TableCell>
                    <TableCell>
                      <Badge variant={schedule.status === "Full" ? "secondary" : "default"}>
                        {schedule.status}
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
