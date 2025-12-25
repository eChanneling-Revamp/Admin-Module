"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, MapPin, Phone, Mail, Building, Globe } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { hospitalApi, type Hospital, type CreateHospitalData, type UpdateHospitalData } from "@/lib/api/hospitalApi"

const provinces = [
  "Western", "Central", "Southern", "Northern", "Eastern",
  "North Western", "North Central", "Uva", "Sabaragamuwa"
]

const hospitalTypes = ["private", "government", "semi-government"]

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterProvince, setFilterProvince] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [formData, setFormData] = useState<CreateHospitalData>({
    name: "",
    email: "",
    address: undefined,
    city: undefined,
    district: undefined,
    contactNumber: undefined,
    website: undefined,
    facilities: [],
    profileImage: undefined,
  })

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
      await hospitalApi.create(formData)
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
      await hospitalApi.update(selectedHospital.id, formData as UpdateHospitalData)
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

  const openEditDialog = (hospital: Hospital) => {
    setSelectedHospital(hospital)
    setFormData({
      name: hospital.name,
      email: hospital.email,
      address: hospital.address || undefined,
      city: hospital.city || undefined,
      district: hospital.district || undefined,
      contactNumber: hospital.contactNumber || undefined,
      website: hospital.website || undefined,
      facilities: hospital.facilities,
      profileImage: hospital.profileImage || undefined,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      address: undefined,
      city: undefined,
      district: undefined,
      contactNumber: undefined,
      website: undefined,
      facilities: [],
      profileImage: undefined,
    })
    setSelectedHospital(null)
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
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-cyan-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
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
            <HospitalForm formData={formData} setFormData={setFormData} />
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
                      <Badge variant={hospital.isActive ? "default" : "secondary"}>
                        {hospital.isActive ? "Active" : "Inactive"}
                      </Badge>
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
          <HospitalForm formData={formData} setFormData={setFormData} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditHospital} className="bg-blue-600">
              Update Hospital
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}

function HospitalForm({ formData, setFormData }: any) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <Label>Hospital Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Lanka Hospital"
        />
      </div>
      <div>
        <Label>Name in Sinhala</Label>
        <Input
          value={formData.nameInSinhala}
          onChange={(e) => setFormData({ ...formData, nameInSinhala: e.target.value })}
          placeholder="ලංකා රෝහල"
        />
      </div>
      <div>
        <Label>Hospital Code *</Label>
        <Input
          value={formData.hospitalCode}
          onChange={(e) => setFormData({ ...formData, hospitalCode: e.target.value })}
          placeholder="LH001"
        />
      </div>
      <div className="col-span-2">
        <Label>Address *</Label>
        <Textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="578, Elvitigala Mawatha, Colombo 05"
          rows={2}
        />
      </div>
      <div>
        <Label>City *</Label>
        <Input
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          placeholder="Colombo"
        />
      </div>
      <div>
        <Label>District *</Label>
        <Input
          value={formData.district}
          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
          placeholder="Colombo"
        />
      </div>
      <div>
        <Label>Province *</Label>
        <Select value={formData.province} onValueChange={(value) => setFormData({ ...formData, province: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select Province" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((province) => (
              <SelectItem key={province} value={province}>{province}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Hospital Type *</Label>
        <Select value={formData.hospitalType} onValueChange={(value) => setFormData({ ...formData, hospitalType: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {hospitalTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Phone *</Label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+94112345678"
        />
      </div>
      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="info@hospital.lk"
        />
      </div>
      <div>
        <Label>Website</Label>
        <Input
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="www.hospital.lk"
        />
      </div>
      <div>
        <Label>Hospital Group</Label>
        <Input
          value={formData.hospitalGroup}
          onChange={(e) => setFormData({ ...formData, hospitalGroup: e.target.value })}
          placeholder="Lanka Hospitals Group"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.emergencyAvailable}
          onCheckedChange={(checked) => setFormData({ ...formData, emergencyAvailable: checked })}
        />
        <Label>24/7 Emergency Available</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label>Active Status</Label>
      </div>
    </div>
  )
}
