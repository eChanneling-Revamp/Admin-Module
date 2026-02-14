"use client"

import { useState, useEffect, type Dispatch, type SetStateAction } from "react"
import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { Plus, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { hospitalApi, type Hospital, type CreateHospitalData, type UpdateHospitalData } from "@/lib/api/hospitalApi"

const createEmptyHospital = (): CreateHospitalData => ({
  name: "",
  email: "",
  address: "",
  city: "",
  district: "",
  contactNumber: "",
  website: "",
  facilities: [],
})

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [formData, setFormData] = useState<CreateHospitalData>(createEmptyHospital())
  const [facilitiesText, setFacilitiesText] = useState("")

  useEffect(() => {
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    try {
      const data = await hospitalApi.getAll()
      setHospitals(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching hospitals:", error)
      setHospitals([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddHospital = async () => {
    try {
      const payload: CreateHospitalData = {
        ...formData,
        facilities: (formData.facilities ?? []).filter(Boolean),
      }
      await hospitalApi.create(payload)
      await fetchHospitals()
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error adding hospital:", error)
    }
  }

  const handleEditHospital = async () => {
    if (!selectedHospital) return
    
    try {
      const payload: UpdateHospitalData = {
        ...formData,
        facilities: (formData.facilities ?? []).filter(Boolean),
      }
      await hospitalApi.update(selectedHospital.id, payload)
      await fetchHospitals()
      setIsEditDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error updating hospital:", error)
    }
  }

  const handleDeleteHospital = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hospital?")) return
    
    try {
      await hospitalApi.delete(id)
      await fetchHospitals()
    } catch (error) {
      console.error("Error deleting hospital:", error)
    }
  }

  const handleUpdateStatus = async (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    try {
      if (status === 'REJECTED' && !confirm('Are you sure you want to reject this hospital?')) return
      await hospitalApi.updateStatus(id, status)
      await fetchHospitals()
    } catch (error) {
      console.error('Error updating hospital status:', error)
    }
  }

  const openEditDialog = (hospital: Hospital) => {
    setSelectedHospital(hospital)
    setFormData({
      name: hospital.name ?? "",
      email: hospital.email ?? "",
      address: hospital.address ?? "",
      city: hospital.city ?? "",
      district: hospital.district ?? "",
      contactNumber: hospital.contactNumber ?? "",
      website: hospital.website ?? "",
      facilities: hospital.facilities ?? [],
    })
    setFacilitiesText((hospital.facilities ?? []).join(", "))
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData(createEmptyHospital())
    setSelectedHospital(null)
    setFacilitiesText("")
  }

  const handleFacilitiesChange = (value: string) => {
    setFacilitiesText(value)
    const facilitiesArray = value
      .split(",")
      .map((facility) => facility.trim())
      .filter(Boolean)
    setFormData((prev) => ({
      ...prev,
      facilities: facilitiesArray,
    }))
  }

  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const stats = {
    total: hospitals.length,
    active: hospitals.filter(h => h.isActive).length,
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
            <h1 className="text-3xl font-bold text-gray-900">Hospital Management</h1>
            <p className="text-gray-600 mt-1">Manage hospitals, facilities, and assignments</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Hospital
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Hospital</DialogTitle>
                <DialogDescription>Enter hospital details to add to the system</DialogDescription>
              </DialogHeader>
              <HospitalForm
                formData={formData}
                setFormData={setFormData}
                facilitiesText={facilitiesText}
                onFacilitiesChange={handleFacilitiesChange}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddHospital} className="bg-blue-600">
                  Add Hospital
                </Button>
              </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Hospitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-600 mt-1">Registered hospitals</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-gray-600 mt-1">Currently operational</p>
            </CardContent>
          </Card>
        </div>


        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>All Hospitals</CardTitle>
                <CardDescription>Registered medical facilities on the platform</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search hospitals..." 
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
                  <TableHead>Email</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHospitals.map((hospital) => (
                  <TableRow key={hospital.id}>
                    <TableCell className="font-medium">{hospital.name}</TableCell>
                    <TableCell className="text-sm text-gray-600">{hospital.email}</TableCell>
                    <TableCell className="text-sm">{hospital.city}</TableCell>
                    <TableCell className="text-sm text-gray-600">{hospital.contactNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={hospital.isActive ? "default" : "secondary"}>
                          {hospital.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-sm text-gray-600">{hospital.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(hospital)}>Edit</Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteHospital(hospital.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(hospital.id, 'APPROVED')}
                          disabled={hospital.status === 'APPROVED'}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleUpdateStatus(hospital.id, 'REJECTED')}
                          disabled={hospital.status === 'REJECTED'}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Hospital</DialogTitle>
            <DialogDescription>Update hospital information</DialogDescription>
          </DialogHeader>
          <HospitalForm
            formData={formData}
            setFormData={setFormData}
            facilitiesText={facilitiesText}
            onFacilitiesChange={handleFacilitiesChange}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditHospital} className="bg-blue-600">
              Update Hospital
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </ProtectedLayout>
  )
}

type HospitalFormProps = {
  formData: CreateHospitalData
  setFormData: Dispatch<SetStateAction<CreateHospitalData>>
  facilitiesText: string
  onFacilitiesChange: (value: string) => void
}

function HospitalForm({ formData, setFormData, facilitiesText, onFacilitiesChange }: HospitalFormProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <Label>Hospital Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Colombo Health Center"
        />
      </div>
      <div className="col-span-2">
        <Label>Address *</Label>
        <Textarea
          value={formData.address}
          onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
          placeholder="120 Galle Road"
          rows={2}
        />
      </div>
      <div>
        <Label>City *</Label>
        <Input
          value={formData.city}
          onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
          placeholder="Colombo"
        />
      </div>
      <div>
        <Label>District *</Label>
        <Input
          value={formData.district}
          onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
          placeholder="Colombo"
        />
      </div>
      <div>
        <Label>Contact Number *</Label>
        <Input
          type="tel"
          value={formData.contactNumber}
          onChange={(e) => setFormData((prev) => ({ ...prev, contactNumber: e.target.value }))}
          placeholder="+94-11-234-5678"
        />
      </div>
      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="info@colombohealth.lk"
        />
      </div>
      <div>
        <Label>Website</Label>
        <Input
          type="url"
          value={formData.website}
          onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
          placeholder="https://colombohealth.lk"
        />
      </div>
      <div className="col-span-2">
        <Label>Facilities (comma separated)</Label>
        <Textarea
          value={facilitiesText}
          onChange={(e) => onFacilitiesChange(e.target.value)}
          placeholder="Emergency, ICU, Cardiology, Pharmacy"
          rows={2}
        />
        <p className="text-xs text-gray-500 mt-1">Press comma to separate multiple facilities.</p>
      </div>
    </div>
  )
}
