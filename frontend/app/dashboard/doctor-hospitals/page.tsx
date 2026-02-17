"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Hospital, Link2, Loader2, Trash2, Plus } from "lucide-react"
import { doctorApi } from "@/lib/api/doctorApi"
import { hospitalApi } from "@/lib/api/hospitalApi"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function DoctorHospitalsPage() {
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalAssignments: 0,
    multiHospitalDoctors: 0,
    activeHospitals: 0,
    weeklySessions: 0
  })

  const [doctors, setDoctors] = useState<any[]>([])
  const [hospitals, setHospitals] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [selectedHospital, setSelectedHospital] = useState("")
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [assignmentData, doctorsData, hospitalsData] = await Promise.all([
        doctorApi.getDoctorHospitalAssignments(),
        doctorApi.getAll(),
        hospitalApi.getAll()
      ])

      setAssignments(assignmentData.assignments || [])
      setStats(assignmentData.stats || {
        totalAssignments: 0,
        multiHospitalDoctors: 0,
        activeHospitals: 0,
        weeklySessions: 0
      })
      setDoctors(doctorsData || [])
      setHospitals(hospitalsData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedDoctor || !selectedHospital) return

    try {
      setAssigning(true)
      await doctorApi.assignHospital({
        doctorId: selectedDoctor,
        hospitalId: selectedHospital
      })
      setIsDialogOpen(false)
      setSelectedDoctor("")
      setSelectedHospital("")
      fetchData() // Refresh data
    } catch (error) {
      console.error("Error assigning hospital:", error)
      alert("Failed to assign doctor to hospital")
    } finally {
      setAssigning(false)
    }
  }

  const handleRemove = async (doctorId: string, hospitalId: string) => {
    if (!confirm("Are you sure you want to remove this assignment?")) return

    try {
      await doctorApi.removeHospital(doctorId, hospitalId)
      fetchData()
    } catch (error) {
      console.error("Error removing assignment:", error)
    }
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hospital Assignments</h1>
            <p className="text-gray-600 mt-1">Manage doctor-hospital relationships and sessions</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsDialogOpen(true)}>
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
              <div className="text-3xl font-bold">{stats.totalAssignments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Multi-Hospital Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.multiHospitalDoctors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Hospitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeHospitals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Weekly Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.weeklySessions}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Doctor-Hospital Assignments</CardTitle>
            <CardDescription>Overview of doctors practicing at multiple hospitals</CardDescription>
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
                    <TableHead>Primary Hospital</TableHead>
                    <TableHead>Additional Hospitals</TableHead>
                    <TableHead>Weekly Sessions</TableHead>
                    <TableHead>Status</TableHead>
                    {/* <TableHead className="text-right">Actions</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{assignment.doctorName}</TableCell>
                      <TableCell>{assignment.specialization}</TableCell>
                      <TableCell>
                        {assignment.primaryHospital ? (
                          <div className="flex items-center gap-2">
                            <Hospital className="w-4 h-4 text-blue-600" />
                            {assignment.primaryHospital.name}
                            {/* <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700" onClick={() => handleRemove(assignment.doctorId, assignment.primaryHospital.id)}><Trash2 className="w-3 h-3" /></Button> */}
                          </div>
                        ) : <span className="text-gray-400">None</span>}
                      </TableCell>
                      <TableCell>
                        {assignment.additionalHospitals.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {assignment.additionalHospitals.map((hospital: any, i: number) => (
                              <div key={i} className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs w-fit">
                                  {hospital.name}
                                </Badge>
                                {/* Only allow removing additional hospitals easily perhaps? For now, implementing remove is complex in UI design. */}
                                <Button variant="ghost" size="icon" className="h-5 w-5 text-red-400 hover:text-red-600" onClick={() => handleRemove(assignment.doctorId, hospital.id)}><Trash2 className="w-3 h-3" /></Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>{assignment.weeklySessions}</TableCell>
                      <TableCell>
                        <Badge variant="default">{assignment.status}</Badge>
                      </TableCell>
                      {/* <TableCell className="text-right">
                      <Button variant="outline" size="sm">Manage</Button>
                    </TableCell> */}
                    </TableRow>
                  ))}
                  {assignments.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-6">No assignments found</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Doctor to Hospital</DialogTitle>
            <DialogDescription>Select a doctor and a hospital to create a new assignment.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Doctor</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
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
            <div>
              <Label>Hospital</Label>
              <Select value={selectedHospital} onValueChange={setSelectedHospital}>
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
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={assigning}>
              {assigning && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
