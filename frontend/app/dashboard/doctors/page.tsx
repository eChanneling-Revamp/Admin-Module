"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, UserPlus, Edit, Trash2 } from "lucide-react"
import { doctorApi, type Doctor } from "@/lib/api/doctorApi"

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<Doctor>>({
    name: "",
    email: "",
    specialization: "",
    qualification: "",
    experience: 0,
    phoneNumber: "",
    consultationFee: 0,
    description: "",
    status: "PENDING",
    isActive: true
  })

  // Toast hook (assuming standard useToast or similar is available, otherwise using console/alert for now or simple custom toast if not imported)
  // Since I don't see useToast imported in original file, I'll add the import if I can, or use a simple alert fallback if it fails.
  // Actually, I'll use the one from proper imports.

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
      setDoctors([])
      // toast({ title: "Error", description: "Failed to fetch doctors", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "experience" || name === "consultationFee" ? Number(value) : value
    }))
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await doctorApi.patchStatus(id, newStatus)
      // Optimistic update
      setDoctors(doctors.map(d => d.id === id ? { ...d, status: newStatus } : d))
    } catch (error) {
      console.error("Error updating status:", error)
      fetchDoctors() // Revert on error
    }
  }

  const handleOpenAdd = () => {
    setCurrentDoctor(null)
    setFormData({
      name: "",
      email: "",
      specialization: "",
      qualification: "",
      experience: 0,
      phoneNumber: "",
      consultationFee: 0,
      description: "",
      status: "PENDING",
      isActive: true
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (doctor: Doctor) => {
    setCurrentDoctor(doctor)
    setFormData({
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience: doctor.experience,
      phoneNumber: doctor.phoneNumber,
      consultationFee: doctor.consultationFee,
      description: doctor.description,
      status: doctor.status,
      isActive: doctor.isActive
    })
    setIsDialogOpen(true)
  }

  const handleSave_Click = async () => {
    try {
      setIsSubmitting(true)
      const dataToSave: any = {
        ...formData,
        experience: Number(formData.experience),
        consultationFee: Number(formData.consultationFee)
      }

      if (currentDoctor) {
        await doctorApi.update(currentDoctor.id, dataToSave)
      } else {
        await doctorApi.create(dataToSave)
      }

      setIsDialogOpen(false)
      fetchDoctors()
    } catch (error) {
      console.error("Error saving doctor:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenDelete = (doctor: Doctor) => {
    setCurrentDoctor(doctor)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!currentDoctor) return
    try {
      setIsSubmitting(true)
      await doctorApi.delete(currentDoctor.id)
      setIsDeleteDialogOpen(false)
      fetchDoctors()
    } catch (error) {
      console.error("Error deleting doctor:", error)
    } finally {
      setIsSubmitting(false)
    }
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

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "APPROVED": return "bg-emerald-500 hover:bg-emerald-600"
      case "REJECTED": return "bg-red-500 hover:bg-red-600"
      default: return "bg-amber-500 hover:bg-amber-600"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-emerald-600" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Management</h1>
          <p className="text-gray-600 mt-1">Manage doctor profiles and schedules</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-emerald-600 hover:bg-emerald-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Add New Doctor
        </Button>
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
            <div className="text-3xl font-bold text-emerald-600">{stats.active}</div>
            <p className="text-xs text-gray-600 mt-1">Currently available</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <CardTitle>All Doctors</CardTitle>
              <CardDescription>Registered medical practitioners on the platform</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
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
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>
                    <div className="font-medium">{doctor.name}</div>
                    <div className="text-xs text-gray-500">{doctor.email}</div>
                  </TableCell>
                  <TableCell>
                    <div>{doctor.specialization}</div>
                    <div className="text-xs text-gray-500">{doctor.qualification}</div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {doctor.phoneNumber}
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={doctor.status}
                      onValueChange={(val) => handleStatusChange(doctor.id, val)}
                    >
                      <SelectTrigger className={`w-[130px] h-8 text-white border-0 ${getStatusColor(doctor.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(doctor)}>
                        <Edit className="w-4 h-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDelete(doctor)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{currentDoctor ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
            <DialogDescription>
              {currentDoctor ? "Update doctor details and status." : "Enter the details for the new doctor."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name || ""} onChange={handleInputChange} placeholder="Dr. John Doe" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" value={formData.email || ""} onChange={handleInputChange} placeholder="doctor@example.com" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input id="specialization" name="specialization" value={formData.specialization || ""} onChange={handleInputChange} placeholder="Cardiology" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input id="qualification" name="qualification" value={formData.qualification || ""} onChange={handleInputChange} placeholder="MBBS, MD" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleInputChange} placeholder="+94 77 123 4567" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="experience">Experience (Years)</Label>
                <Input id="experience" name="experience" type="number" value={formData.experience || 0} onChange={handleInputChange} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="consultationFee">Consultation Fee (LKR)</Label>
              <Input id="consultationFee" name="consultationFee" type="number" value={formData.consultationFee || 0} onChange={handleInputChange} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" value={formData.description || ""} onChange={handleInputChange} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || "PENDING"}
                onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSave_Click} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
              {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Doctor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-gray-900">{currentDoctor?.name}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleConfirmDelete} disabled={isSubmitting} variant="destructive">
              {isSubmitting ? "Deleting..." : "Delete Doctor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
