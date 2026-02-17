"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Stethoscope, Users, TrendingUp, Search, Edit2 } from "lucide-react"
import { doctorApi, type Doctor } from "@/lib/api/doctorApi"

interface SpecializationStat {
  name: string
  doctorCount: number
  activeDoctors: number
}

export default function SpecializationsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [newSpecialization, setNewSpecialization] = useState("")
  const [specializationFilter, setSpecializationFilter] = useState("")

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const data = await doctorApi.getAll()
      setDoctors(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching doctors:", error)
    } finally {
      setLoading(false)
    }
  }

  const specializationStats = useMemo(() => {
    const stats: Record<string, SpecializationStat> = {}

    doctors.forEach(doc => {
      const spec = doc.specialization || "Uncategorized"
      if (!stats[spec]) {
        stats[spec] = { name: spec, doctorCount: 0, activeDoctors: 0 }
      }
      stats[spec].doctorCount++
      if (doc.isActive) stats[spec].activeDoctors++
    })

    return Object.values(stats).sort((a, b) => b.doctorCount - a.doctorCount)
  }, [doctors])

  const filteredDoctors = useMemo(() => {
    if (!selectedSpec) return []
    return doctors.filter(d => (d.specialization || "Uncategorized") === selectedSpec)
  }, [doctors, selectedSpec])

  const handleOpenDetails = (specName: string) => {
    setSelectedSpec(specName)
    setIsDetailOpen(true)
  }

  const handleEditDoctorSpec = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setNewSpecialization(doctor.specialization)
    setIsEditOpen(true)
  }

  const handleSaveSpec = async () => {
    if (!editingDoctor || !newSpecialization.trim()) return

    try {
      await doctorApi.update(editingDoctor.id, { specialization: newSpecialization })
      await fetchDoctors() // Refresh data
      setIsEditOpen(false)
      // If we moved the doctor out of the current view, they will disappear from the list, which is expected.
      if (selectedSpec && newSpecialization !== selectedSpec) {
        // Optionally close detail view or keep it open to see updated list
      }
    } catch (error) {
      console.error("Error updating specialization:", error)
    }
  }

  const totalDoctors = doctors.length
  const totalSpecializations = specializationStats.length
  const activeDoctors = doctors.filter(d => d.isActive).length

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medical Specializations</h1>
            <p className="text-gray-600 mt-1">Overview of medical specialties and resource allocation</p>
          </div>
          {/* <Button className="bg-blue-600 hover:bg-blue-700">
            Add Specialization
          </Button> */}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Specializations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSpecializations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalDoctors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{activeDoctors}</div>
            </CardContent>
          </Card>
        </div>

        {/* Specialization Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specializationStats.map((spec, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleOpenDetails(spec.name)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{spec.name}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-blue-600 border-blue-300">
                        {spec.activeDoctors} Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{spec.doctorCount}</div>
                    <div className="text-xs text-gray-500">Doctors Assigned</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation()
                    handleOpenDetails(spec.name)
                  }}>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedSpec} - Doctors List</DialogTitle>
            <DialogDescription>
              Manage doctors assigned to this specialization.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {filteredDoctors.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No doctors found in this specialization.</p>
            ) : (
              <div className="border rounded-md divide-y">
                {filteredDoctors.map(doctor => (
                  <div key={doctor.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                        {doctor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doctor.name}</p>
                        <p className="text-sm text-gray-500">{doctor.qualification}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={doctor.isActive ? "default" : "secondary"}>
                        {doctor.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => handleEditDoctorSpec(doctor)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Change Spec
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Specialization Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Specialization</DialogTitle>
            <DialogDescription>
              Update specialization for {editingDoctor?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="spec" className="text-right">Specialization</Label>
              <div className="col-span-3">
                <Input
                  id="spec"
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  placeholder="e.g. Cardiology"
                />
                {/* Optional: Add a datalist or select if we have a strict list of specs */}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSpec}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
