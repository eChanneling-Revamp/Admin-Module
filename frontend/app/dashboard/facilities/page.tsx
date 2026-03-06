"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
  CheckCircle2,
  Plus,
  Search,
  Building2,
  Heart,
  Baby,
  Siren,
  FlaskConical,
  Pill,
  Car,
  Truck,
  Wifi,
  X,
  Filter,
  Download,
  MoreHorizontal,
  Edit,
  Hospital as HospitalIcon,
  Sparkles,
  Loader2,
  Stethoscope,
  Activity
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { hospitalApi, type Hospital } from "@/lib/api/hospitalApi"
import { useToast } from "@/components/ui/use-toast"

// Configuration for known facilities to give them specific icons/colors
// Unknown facilities will use a default style
const knownFacilities: Record<string, { icon: any, color: string, bg: string, border: string }> = {
  "ICU": { icon: Heart, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
  "NICU": { icon: Baby, color: "text-pink-500", bg: "bg-pink-50", border: "border-pink-200" },
  "Emergency": { icon: Siren, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
  "Laboratory": { icon: FlaskConical, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-200" },
  "Pharmacy": { icon: Pill, color: "text-green-500", bg: "bg-green-50", border: "border-green-200" },
  "Parking": { icon: Car, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
  "Ambulance": { icon: Truck, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  "WiFi": { icon: Wifi, color: "text-cyan-500", bg: "bg-cyan-50", border: "border-cyan-200" },
}

const defaultFacilityStyle = {
  icon: Activity,
  color: "text-slate-500",
  bg: "bg-slate-100",
  border: "border-slate-200"
}

export default function FacilitiesPage() {
  const { toast } = useToast()
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")

  // Edit Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null)
  const [editFacilities, setEditFacilities] = useState<string[]>([])
  const [newFacilityInput, setNewFacilityInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Global Add Facility State
  const [isGlobalAddOpen, setIsGlobalAddOpen] = useState(false)
  const [globalFacilityName, setGlobalFacilityName] = useState("")
  const [selectedGlobalHospitalIds, setSelectedGlobalHospitalIds] = useState<string[]>([])

  const fetchHospitals = async () => {
    try {
      setLoading(true)
      const data = await hospitalApi.getAll()
      setHospitals(data)
    } catch (error) {
      console.error("Failed to fetch hospitals:", error)
      toast({
        title: "Error",
        description: "Failed to load hospitals",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHospitals()
  }, [])

  // Derived state: Get all unique facilities across all hospitals
  const allFacilities = useMemo(() => {
    const facilities = new Set<string>()
    hospitals.forEach(h => {
      if (h.facilities) {
        h.facilities.forEach(f => facilities.add(f))
      }
    })
    return Array.from(facilities).sort()
  }, [hospitals])

  const handleEditClick = (hospital: Hospital) => {
    setEditingHospital(hospital)
    setEditFacilities(hospital.facilities ? [...hospital.facilities] : [])
    setNewFacilityInput("")
    setIsDialogOpen(true)
  }

  const handleAddFacility = () => {
    if (!newFacilityInput.trim()) return
    const facilityName = newFacilityInput.trim()

    if (!editFacilities.some(f => f.toLowerCase() === facilityName.toLowerCase())) {
      setEditFacilities([...editFacilities, facilityName])
    }
    setNewFacilityInput("")
  }

  const handleRemoveFacility = (facilityToRemove: string) => {
    setEditFacilities(editFacilities.filter(f => f !== facilityToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddFacility()
    }
  }

  const handleSaveFacilities = async () => {
    if (!editingHospital) return

    try {
      setIsSubmitting(true)
      await hospitalApi.updateFacilities(editingHospital.id, editFacilities)

      toast({
        title: "Success",
        description: "Facilities updated successfully",
      })
      setIsDialogOpen(false)
      fetchHospitals() // Refresh data
    } catch (error) {
      console.error("Failed to update facilities:", error)
      toast({
        title: "Error",
        description: "Failed to update facilities",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Global Add Functions
  const handleGlobalAddOpen = () => {
    setGlobalFacilityName("")
    setSelectedGlobalHospitalIds([])
    setIsGlobalAddOpen(true)
  }

  const handleGlobalToggleHospital = (id: string) => {
    setSelectedGlobalHospitalIds(prev =>
      prev.includes(id) ? prev.filter(hId => hId !== id) : [...prev, id]
    )
  }

  const handleGlobalSelectAll = () => {
    if (selectedGlobalHospitalIds.length === hospitals.length) {
      setSelectedGlobalHospitalIds([])
    } else {
      setSelectedGlobalHospitalIds(hospitals.map(h => h.id))
    }
  }

  const handleGlobalSave = async () => {
    if (!globalFacilityName.trim() || selectedGlobalHospitalIds.length === 0) return

    try {
      setIsSubmitting(true)
      const facilityToAdd = globalFacilityName.trim()

      // Update each selected hospital
      const updatePromises = selectedGlobalHospitalIds.map(async (hospitalId) => {
        const hospital = hospitals.find(h => h.id === hospitalId)
        if (!hospital) return

        const currentFacilities = hospital.facilities || []
        // Avoid duplicates
        if (currentFacilities.some(f => f.toLowerCase() === facilityToAdd.toLowerCase())) return

        const updatedFacilities = [...currentFacilities, facilityToAdd]
        return hospitalApi.updateFacilities(hospitalId, updatedFacilities)
      })

      await Promise.all(updatePromises)

      toast({
        title: "Success",
        description: `Added "${facilityToAdd}" to ${selectedGlobalHospitalIds.length} hospitals`,
      })
      setIsGlobalAddOpen(false)
      fetchHospitals()
    } catch (error) {
      console.error("Failed to batch update facilities:", error)
      toast({
        title: "Error",
        description: "Failed to update facilities",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredData = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.city.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = selectedFilter === "all" ||
      (hospital.facilities && hospital.facilities.some(f => f === selectedFilter))

    return matchesSearch && matchesFilter
  })

  // Helper to get facility style
  const getFacilityStyle = (name: string) => {
    // Try exact match
    if (knownFacilities[name]) return knownFacilities[name]

    // Try case-insensitive match
    const foundKey = Object.keys(knownFacilities).find(k => k.toLowerCase() === name.toLowerCase())
    if (foundKey) return knownFacilities[foundKey]

    return defaultFacilityStyle
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Hospital Facilities</h1>
            <p className="text-slate-500 text-sm">Manage and monitor hospital amenities and services</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleGlobalAddOpen} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Facility
          </Button>
          <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <HospitalIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Hospitals</p>
              <h3 className="text-2xl font-bold text-slate-800">{hospitals.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Unique Facilities</p>
              <h3 className="text-2xl font-bold text-slate-800">{allFacilities.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Services</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {hospitals.reduce((acc, h) => acc + (h.facilities?.length || 0), 0)}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search hospitals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 min-w-[200px]">
                <Filter className="w-4 h-4 text-slate-500" />
                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by facility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Facilities</SelectItem>
                    {allFacilities.map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="text-sm text-slate-500 whitespace-nowrap hidden sm:inline">
                <span className="font-semibold text-slate-700">{filteredData.length}</span> hospitals
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facilities Table */}
      <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50/50 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-800">Facility Overview</CardTitle>
                <CardDescription className="text-slate-500">Comprehensive list of facilities per hospital</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="font-semibold text-slate-700 pl-6 w-[300px]">Hospital</TableHead>
                  <TableHead className="font-semibold text-slate-700">Available Facilities</TableHead>
                  <TableHead className="text-center w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((hospital) => (
                  <TableRow
                    key={hospital.id}
                    className="hover:bg-emerald-50/30 transition-colors group"
                  >
                    <TableCell className="pl-6 align-top py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl flex items-center justify-center text-emerald-700 font-bold text-sm">
                          {hospital.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{hospital.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500">{hospital.city}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-wrap gap-2">
                        {hospital.facilities && hospital.facilities.length > 0 ? (
                          hospital.facilities.map((facility) => {
                            const style = getFacilityStyle(facility)
                            const Icon = style.icon
                            return (
                              <Badge
                                key={facility}
                                variant="outline"
                                className={`${style.bg} ${style.border} ${style.color} hover:${style.bg} px-2 py-1 gap-1.5`}
                              >
                                <Icon className="w-3 h-3" />
                                {facility}
                              </Badge>
                            )
                          })
                        ) : (
                          <span className="text-sm text-slate-400 italic">No facilities listed</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center align-top py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-50">
                            <MoreHorizontal className="w-4 h-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditClick(hospital)}>
                            <Edit className="w-4 h-4 mr-2 text-slate-500" />
                            Edit Facilities
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No hospitals found</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filter</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Facilities Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Facilities</DialogTitle>
            <DialogDescription>
              Manage available facilities for <span className="font-semibold">{editingHospital?.name}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <Label className="text-slate-700">Add New Facility</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. MRI, Cafeteria, Helipad..."
                  value={newFacilityInput}
                  onChange={(e) => setNewFacilityInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleAddFacility} variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-slate-700">Current Facilities ({editFacilities.length})</Label>
              <div className="min-h-[100px] p-4 bg-slate-50 rounded-xl border border-slate-100">
                {editFacilities.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {editFacilities.map((facility) => {
                      const style = getFacilityStyle(facility)
                      const Icon = style.icon
                      return (
                        <div
                          key={facility}
                          className={`flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-md border text-sm font-medium ${style.bg} ${style.border} ${style.color}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{facility}</span>
                          <button
                            onClick={() => handleRemoveFacility(facility)}
                            className={`ml-1 p-0.5 rounded-full hover:bg-white/50 transition-colors`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                    <p>No facilities added yet</p>
                    <p className="text-xs mt-1">Add facilities using the input above</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSaveFacilities} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Global Add Facility Dialog */}
      <Dialog open={isGlobalAddOpen} onOpenChange={setIsGlobalAddOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Facility</DialogTitle>
            <DialogDescription>
              Add a new facility to multiple hospitals at once.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <Label className="text-slate-700">Facility Name</Label>
              <Input
                placeholder="e.g. 5G WiFi, Parking, MRI..."
                value={globalFacilityName}
                onChange={(e) => setGlobalFacilityName(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-700">Select Hospitals ({selectedGlobalHospitalIds.length})</Label>
                <div className="space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedGlobalHospitalIds([])} className="text-xs">
                    Clear
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleGlobalSelectAll} className="text-xs text-emerald-600">
                    Select All
                  </Button>
                </div>
              </div>
              <div className="h-[300px] border border-slate-100 rounded-xl overflow-y-auto p-2 bg-slate-50">
                {hospitals.map(hospital => (
                  <div
                    key={hospital.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white transition-colors cursor-pointer border-b border-slate-100 last:border-0"
                    onClick={() => handleGlobalToggleHospital(hospital.id)}
                  >
                    <Checkbox
                      checked={selectedGlobalHospitalIds.includes(hospital.id)}
                      onCheckedChange={() => handleGlobalToggleHospital(hospital.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{hospital.name}</p>
                      <p className="text-xs text-slate-500">{hospital.city}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                      {hospital.facilities?.slice(0, 3).map((f, i) => (
                        <span key={i} className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">{f}</span>
                      ))}
                      {(hospital.facilities?.length || 0) > 3 && (
                        <span className="text-[10px] text-slate-400">+{hospital.facilities!.length - 3}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGlobalAddOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button
              onClick={handleGlobalSave}
              disabled={isSubmitting || !globalFacilityName.trim() || selectedGlobalHospitalIds.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update {selectedGlobalHospitalIds.length} Hospitals
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
