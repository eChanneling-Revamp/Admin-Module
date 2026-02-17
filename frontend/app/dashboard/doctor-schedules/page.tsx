"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Plus, Edit2, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { doctorApi, type DoctorSchedule } from "@/lib/api/doctorApi"
import { hospitalApi } from "@/lib/api/hospitalApi"
import { format } from "date-fns"

export default function DoctorSchedulesPage() {
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [doctors, setDoctors] = useState<any[]>([])
  const [hospitals, setHospitals] = useState<any[]>([])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentSchedule, setCurrentSchedule] = useState<any>(null)
  const [formData, setFormData] = useState({
    doctorId: "",
    hospitalId: "",
    date: "",
    startTime: "",
    endTime: "",
    capacity: 20,
    location: "Consultation Room 1",
    status: "SCHEDULED"
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [schedulesData, doctorsData, hospitalsData] = await Promise.all([
        doctorApi.getSchedules(),
        doctorApi.getAll(),
        hospitalApi.getAll()
      ])

      setSchedules(schedulesData.schedules || [])
      setDoctors(doctorsData || [])
      setHospitals(hospitalsData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setCurrentSchedule(null)
    setFormData({
      doctorId: "",
      hospitalId: "",
      date: "",
      startTime: "",
      endTime: "",
      capacity: 20,
      location: "Consultation Room 1",
      status: "SCHEDULED"
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (schedule: DoctorSchedule) => {
    setCurrentSchedule(schedule)
    setFormData({
      doctorId: schedule.doctorId,
      hospitalId: schedule.hospitalId,
      date: schedule.scheduledAt ? new Date(schedule.scheduledAt).toISOString().split('T')[0] : "",
      startTime: schedule.startTime ? new Date(schedule.startTime).toTimeString().slice(0, 5) : "",
      endTime: schedule.endTime ? new Date(schedule.endTime).toTimeString().slice(0, 5) : "",
      capacity: schedule.capacity,
      location: schedule.location,
      status: schedule.sessionStatus
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        // Combine date and time for backend if needed, or send as is if backend handles it
        // The backend expects ISO strings for dates
        startTime: new Date(`${formData.date}T${formData.startTime}`).toISOString(),
        endTime: new Date(`${formData.date}T${formData.endTime}`).toISOString(),
        date: new Date(formData.date).toISOString(),
        capacity: Number(formData.capacity)
      }

      if (currentSchedule) {
        await doctorApi.updateSchedule(currentSchedule.id, payload)
      } else {
        await doctorApi.createSchedule(payload)
      }

      setIsDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Error saving schedule:", error)
      alert("Failed to save schedule. Please check all fields.")
    }
  }

  // Calculate stats
  const totalSchedules = schedules.length
  const todaySchedules = schedules.filter(s => {
    const today = new Date().toISOString().split('T')[0]
    return s.scheduledAt && new Date(s.scheduledAt).toISOString().split('T')[0] === today
  }).length
  const availableSlots = schedules.reduce((acc, s) => acc + s.available, 0)

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Schedules</h1>
            <p className="text-gray-600 mt-1">Manage appointment schedules and availability</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleOpenCreate}>
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
              <div className="text-3xl font-bold">{totalSchedules}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Today's Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{todaySchedules}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Available Slots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{availableSlots}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">Live Updates Active</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Schedule List</CardTitle>
            <CardDescription>Active doctor schedules and appointment availability</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Slots</TableHead>
                    <TableHead>Booked</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.doctorName}</TableCell>
                      <TableCell>{schedule.specialization}</TableCell>
                      <TableCell>{schedule.hospitalName}</TableCell>
                      <TableCell>{schedule.scheduledAt ? format(new Date(schedule.scheduledAt), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {schedule.startTime ? format(new Date(schedule.startTime), 'hh:mm a') : ''} -
                          {schedule.endTime ? format(new Date(schedule.endTime), 'hh:mm a') : ''}
                        </div>
                      </TableCell>
                      <TableCell>{schedule.capacity}</TableCell>
                      <TableCell>{schedule.booked}</TableCell>
                      <TableCell>
                        <Badge variant={schedule.isFull ? "secondary" : "default"}>
                          {schedule.sessionStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleOpenEdit(schedule)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {schedules.length === 0 && <TableRow><TableCell colSpan={9} className="text-center py-6">No schedules found</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{currentSchedule ? 'Edit Schedule' : 'Create New Schedule'}</DialogTitle>
            <DialogDescription>Set up doctor availability for appointments</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Doctor</Label>
                <Select value={formData.doctorId} onValueChange={(v) => setFormData({ ...formData, doctorId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name} ({d.specialization})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Hospital</Label>
                <Select value={formData.hospitalId} onValueChange={(v) => setFormData({ ...formData, hospitalId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map(h => (
                      <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Start Time</Label>
                <Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
              </div>
              <div>
                <Label>End Time</Label>
                <Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
