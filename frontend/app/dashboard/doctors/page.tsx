"use client"

import { useState, useEffect } from "react"
import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Search, UserPlus, Edit, Trash2 } from "lucide-react"
import { doctorApi, type Doctor, type CreateDoctorData, type UpdateDoctorData } from "@/lib/api/doctorApi"

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [formData, setFormData] = useState<CreateDoctorData>({
    name: "",
    email: "",
    specialization: "",
    qualification: "",
    experience: undefined,
    phoneNumber: "",
    consultationFee: undefined,
    description: "",
  })
  const [editFormData, setEditFormData] = useState<UpdateDoctorData>({
    name: "",
    email: "",
    specialization: "",
    qualification: "",
    experience: undefined,
    phoneNumber: "",
    consultationFee: undefined,
    description: "",
    isActive: true,
  })
  const [updatingDoctorId, setUpdatingDoctorId] = useState<string | null>(null)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const data = await doctorApi.getAll()
      setDoctors(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching doctors:", error)
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return
    
    try {
      await doctorApi.delete(id)
      await fetchDoctors()
    } catch (error) {
      console.error("Error deleting doctor:", error)
    }
  }

  const handleUpdateDoctorStatus = async (id: string, status: string) => {
    if (!confirm(`Are you sure you want to set status to ${status}?`)) return
    try {
      setUpdatingDoctorId(id)
      await doctorApi.patchStatus(id, status)
      await fetchDoctors()
    } catch (error) {
      console.error('Error updating doctor status:', error)
    } finally {
      setUpdatingDoctorId(null)
    }
  }

  const handleAddDoctor = async () => {
    try {
      await doctorApi.create({
        name: formData.name.trim(),
        email: formData.email.trim(),
        specialization: formData.specialization?.trim() || undefined,
        qualification: formData.qualification?.trim() || undefined,
        experience: formData.experience ? Number(formData.experience) : undefined,
        phoneNumber: formData.phoneNumber?.trim() || undefined,
        consultationFee: formData.consultationFee ? Number(formData.consultationFee) : undefined,
        description: formData.description?.trim() || undefined,
      })
      await fetchDoctors()
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error creating doctor:", error)
    }
  }

  const handleEditDoctor = async () => {
    if (!selectedDoctor) {
      return
    }

    try {
      await doctorApi.update(selectedDoctor.id, {
        name: editFormData.name?.trim() || undefined,
        email: editFormData.email?.trim() || undefined,
        specialization: editFormData.specialization?.trim() || undefined,
        qualification: editFormData.qualification?.trim() || undefined,
        experience: editFormData.experience ? Number(editFormData.experience) : undefined,
        phoneNumber: editFormData.phoneNumber?.trim() || undefined,
        consultationFee: editFormData.consultationFee ? Number(editFormData.consultationFee) : undefined,
        description: editFormData.description?.trim() || undefined,
        isActive: editFormData.isActive,
      })
      await fetchDoctors()
      setIsEditDialogOpen(false)
      resetEditForm()
    } catch (error) {
      console.error("Error updating doctor:", error)
    }
  }

  const openEditDialog = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setEditFormData({
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience: doctor.experience,
      phoneNumber: doctor.phoneNumber,
      consultationFee: doctor.consultationFee,
      description: doctor.description,
      isActive: doctor.isActive,
      status: doctor.status,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      specialization: "",
      qualification: "",
      experience: undefined,
      phoneNumber: "",
      consultationFee: undefined,
      description: "",
    })
  }

  const resetEditForm = () => {
    setSelectedDoctor(null)
    setEditFormData({
      name: "",
      email: "",
      specialization: "",
      qualification: "",
      experience: undefined,
      phoneNumber: "",
      consultationFee: undefined,
      description: "",
      isActive: true,
    })
  }

  const filteredDoctors = doctors.filter((doctor) => {
    return doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const stats = {
    total: doctors.length,
    active: doctors.filter(d => d.isActive).length,
  }

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-cyan-600" />
        </div>
      </ProtectedLayout>
    )
  }
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Management</h1>
            <p className="text-gray-600 mt-1">Manage doctor profiles and schedules</p>
          </div>
          <Dialog
            open={isAddDialogOpen}
            onOpenChange={(open) => {
              setIsAddDialogOpen(open)
              if (open) {
                resetForm()
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add New Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Doctor</DialogTitle>
                <DialogDescription>Enter doctor details to add to the system</DialogDescription>
              </DialogHeader>
              <DoctorForm formData={formData} setFormData={setFormData} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddDoctor} className="bg-blue-600">
                  Add Doctor
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-600 mt-1">Registered doctors</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-gray-600 mt-1">Currently available</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>All Doctors</CardTitle>
                <CardDescription>Registered medical practitioners on the platform</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search doctors..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">{doctor.name}</TableCell>
                    <TableCell>{doctor.specialization}</TableCell>
                    <TableCell className="text-sm text-gray-600">{doctor.email}</TableCell>
                    <TableCell className="text-sm">{doctor.experience} years</TableCell>
                    <TableCell className="text-sm text-gray-600">{doctor.phoneNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className="uppercase text-xs">
                            {doctor.status}
                          </Badge>
                          {doctor.status !== 'APPROVED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateDoctorStatus(doctor.id, 'APPROVED')}
                              disabled={updatingDoctorId === doctor.id}
                            >
                              Approve
                            </Button>
                          )}
                          {doctor.status !== 'REJECTED' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUpdateDoctorStatus(doctor.id, 'REJECTED')}
                              disabled={updatingDoctorId === doctor.id}
                            >
                              Reject
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(doctor)}>Edit</Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteDoctor(doctor.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            resetEditForm()
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
            <DialogDescription>Update doctor details</DialogDescription>
          </DialogHeader>
          <EditDoctorForm
            formData={editFormData}
            setFormData={setEditFormData}
            selectedDoctor={selectedDoctor}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditDoctor} className="bg-blue-600">
              Update Doctor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedLayout>
  )
}

function DoctorForm({
  formData,
  setFormData,
}: {
  formData: CreateDoctorData
  setFormData: React.Dispatch<React.SetStateAction<CreateDoctorData>>
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <Label>Doctor Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Dr. Jane Doe"
        />
      </div>
      <div className="col-span-2">
        <Label>Email *</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="doctor@echannelling.lk"
        />
      </div>
      <div>
        <Label>Specialization</Label>
        <Input
          value={formData.specialization || ""}
          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
          placeholder="Cardiology"
        />
      </div>
      <div>
        <Label>Qualification</Label>
        <Input
          value={formData.qualification || ""}
          onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
          placeholder="MBBS, MD"
        />
      </div>
      <div>
        <Label>Experience (years)</Label>
        <Input
          type="number"
          value={formData.experience ?? ""}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value === "" ? undefined : Number(e.target.value) })}
          placeholder="8"
          min={0}
        />
      </div>
      <div>
        <Label>Contact Number</Label>
        <Input
          value={formData.phoneNumber || ""}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          placeholder="+94112345678"
        />
      </div>
      <div>
        <Label>Consultation Fee</Label>
        <Input
          type="number"
          value={formData.consultationFee ?? ""}
          onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value === "" ? undefined : Number(e.target.value) })}
          placeholder="2500"
          min={0}
        />
      </div>
      <div className="col-span-2">
        <Label>Description</Label>
        <Input
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Short profile summary"
        />
      </div>
    </div>
  )
}

function EditDoctorForm({
  formData,
  setFormData,
  selectedDoctor,
}: {
  formData: UpdateDoctorData
  setFormData: React.Dispatch<React.SetStateAction<UpdateDoctorData>>
  selectedDoctor: Doctor | null
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <Label>Email</Label>
        <Input type="email" value={selectedDoctor?.email || ""} readOnly disabled />
      </div>
      <div className="col-span-2">
        <Label>Doctor Name</Label>
        <Input
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Dr. Jane Doe"
        />
      </div>
      <div>
        <Label>Specialization</Label>
        <Input
          value={formData.specialization || ""}
          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
          placeholder="Cardiology"
        />
      </div>
      <div>
        <Label>Qualification</Label>
        <Input
          value={formData.qualification || ""}
          onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
          placeholder="MBBS, MD"
        />
      </div>
      <div>
        <Label>Experience (years)</Label>
        <Input
          type="number"
          value={formData.experience ?? ""}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value === "" ? undefined : Number(e.target.value) })}
          placeholder="8"
          min={0}
        />
      </div>
      <div>
        <Label>Contact Number</Label>
        <Input
          value={formData.phoneNumber || ""}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          placeholder="+94112345678"
        />
      </div>
      <div>
        <Label>Consultation Fee</Label>
        <Input
          type="number"
          value={formData.consultationFee ?? ""}
          onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value === "" ? undefined : Number(e.target.value) })}
          placeholder="2500"
          min={0}
        />
      </div>
      <div className="col-span-2">
        <Label>Description</Label>
        <Input
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Short profile summary"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          checked={!!formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label>Active Status</Label>
      </div>
    </div>
  )
}
