"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, Clock } from "lucide-react"
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
import { hospitalApi, type Hospital, type CreateHospitalData, type UpdateHospitalData, type HospitalStatus } from "@/lib/api/hospitalApi"
import { useToast } from "@/hooks/use-toast"

export default function HospitalsPage() {
  const { toast } = useToast()
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [formData, setFormData] = useState<CreateHospitalData>({
    name: "",
    email: "",
    address: "",
    city: "",
    district: "",
    contactNumber: "",
    website: "",
    facilities: [],
    profileImage: "",
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
      toast({
        title: "Error",
        description: "Failed to fetch hospitals",
        variant: "destructive",
      })
      setHospitals([])
    } finally {
      setLoading(false)
    }
  }

  const getCleanFormData = (data: CreateHospitalData) => {
    const cleaned = { ...data }

    const cleanString = (val?: string) => {
      if (!val) return undefined
      const trimmed = val.trim()
      return trimmed === '' ? undefined : trimmed
    }

    // Required fields - keep them but trim
    cleaned.name = cleanString(cleaned.name) || cleaned.name
    cleaned.email = cleanString(cleaned.email) || cleaned.email

    // Optional fields
    cleaned.address = cleanString(cleaned.address)
    cleaned.city = cleanString(cleaned.city)
    cleaned.district = cleanString(cleaned.district)
    cleaned.contactNumber = cleanString(cleaned.contactNumber)

    // Handle URL fields
    let website = cleanString(cleaned.website)
    if (website && !website.match(/^https?:\/\//)) {
      website = `https://${website}`
    }
    cleaned.website = website

    cleaned.profileImage = cleanString(cleaned.profileImage)

    // Clean up undefined values
    if (!cleaned.address) delete cleaned.address
    if (!cleaned.city) delete cleaned.city
    if (!cleaned.district) delete cleaned.district
    if (!cleaned.contactNumber) delete cleaned.contactNumber
    if (!cleaned.website) delete cleaned.website
    if (!cleaned.profileImage) delete cleaned.profileImage

    // Ensure facilities is an array
    if (!Array.isArray(cleaned.facilities)) {
      cleaned.facilities = []
    }

    return cleaned
  }

  const handleAddHospital = async () => {
    try {
      const payload = getCleanFormData(formData)
      await hospitalApi.create(payload)
      await fetchHospitals()
      setIsAddDialogOpen(false)
      resetForm()
      toast({
        title: "Success",
        description: "Hospital added successfully",
      })
    } catch (error: any) {
      console.error("Error adding hospital:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add hospital",
        variant: "destructive",
      })
    }
  }

  const handleEditHospital = async () => {
    if (!selectedHospital) return

    try {
      const payload = getCleanFormData(formData)
      await hospitalApi.update(selectedHospital.id, payload as UpdateHospitalData)
      await fetchHospitals()
      setIsEditDialogOpen(false)
      resetForm()
      toast({
        title: "Success",
        description: "Hospital updated successfully",
      })
    } catch (error: any) {
      console.error("Error updating hospital:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update hospital",
        variant: "destructive",
      })
    }
  }

  const handleDeleteHospital = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hospital?")) return

    try {
      await hospitalApi.delete(id)
      await fetchHospitals()
      toast({
        title: "Success",
        description: "Hospital deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting hospital:", error)
      toast({
        title: "Error",
        description: "Failed to delete hospital",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (id: string, status: HospitalStatus) => {
    try {
      await hospitalApi.updateStatus(id, status)
      await fetchHospitals()
      toast({
        title: "Success",
        description: `Hospital status updated to ${status}`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update hospital status",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (hospital: Hospital) => {
    setSelectedHospital(hospital)
    setFormData({
      name: hospital.name,
      email: hospital.email,
      address: hospital.address || "",
      city: hospital.city || "",
      district: hospital.district || "",
      contactNumber: hospital.contactNumber || "",
      website: hospital.website || "",
      facilities: hospital.facilities || [],
      profileImage: hospital.profileImage || "",
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      address: "",
      city: "",
      district: "",
      contactNumber: "",
      website: "",
      facilities: [],
      profileImage: "",
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
    pending: hospitals.filter(h => h.status === 'PENDING').length
  }

  const getStatusBadge = (status: HospitalStatus) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
              <p className="text-xs text-gray-600 mt-1">Awaiting approval</p>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHospitals.map((hospital) => (
                  <TableRow key={hospital.id}>
                    <TableCell className="font-medium">
                      <div>{hospital.name}</div>
                      <div className="text-xs text-gray-500">{hospital.contactNumber}</div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{hospital.email}</TableCell>
                    <TableCell className="text-sm">{hospital.city}</TableCell>
                    <TableCell>
                      {getStatusBadge(hospital.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {hospital.status !== 'APPROVED' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleStatusChange(hospital.id, 'APPROVED')}
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {hospital.status !== 'REJECTED' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleStatusChange(hospital.id, 'REJECTED')}
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {hospital.status !== 'PENDING' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                            onClick={() => handleStatusChange(hospital.id, 'PENDING')}
                            title="Mark as Pending"
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
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

function HospitalForm({ formData, setFormData }: { formData: CreateHospitalData, setFormData: (data: CreateHospitalData) => void }) {
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
      <div className="col-span-2">
        <Label>Address *</Label>
        <Textarea
          value={formData.address || ''}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="578, Elvitigala Mawatha, Colombo 05"
          rows={2}
        />
      </div>
      <div>
        <Label>City *</Label>
        <Input
          value={formData.city || ''}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          placeholder="Colombo"
        />
      </div>
      <div>
        <Label>District *</Label>
        <Input
          value={formData.district || ''}
          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
          placeholder="Colombo"
        />
      </div>
      <div>
        <Label>Contact Number *</Label>
        <Input
          value={formData.contactNumber || ''}
          onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
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
      <div className="col-span-2">
        <Label>Website</Label>
        <Input
          value={formData.website || ''}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="www.hospital.lk"
        />
      </div>
      <div className="col-span-2">
        <Label>Profile Image URL (optional)</Label>
        <Input
          value={formData.profileImage || ''}
          onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
          placeholder="https://example.com/image.png"
        />
      </div>
      <div className="col-span-2">
        <Label>Facilities (Comma separated)</Label>
        <Textarea
          value={formData.facilities?.join(', ') || ''}
          onChange={(e) => setFormData({
            ...formData,
            facilities: e.target.value.split(',').map(f => f.trim()).filter(Boolean)
          })}
          placeholder="Emergency, ICU, Cardiology, Pharmacy"
          rows={2}
        />
        <p className="text-xs text-gray-500 mt-1">Enter facilities separated by commas</p>
      </div>
    </div>
  )
}
