"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Eye,
  Hospital,
  Sparkles
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const facilitiesData = [
  { id: 1, hospital: "Asiri Hospital Colombo", location: "Colombo", type: "Private", icu: true, nicu: true, emergency: true, lab: true, pharmacy: true, parking: true, ambulance: true, wifi: true },
  { id: 2, hospital: "Lanka Hospitals", location: "Colombo", type: "Private", icu: true, nicu: true, emergency: true, lab: true, pharmacy: true, parking: true, ambulance: true, wifi: true },
  { id: 3, hospital: "Nawaloka Hospital", location: "Colombo", type: "Private", icu: true, nicu: false, emergency: true, lab: true, pharmacy: true, parking: true, ambulance: true, wifi: true },
  { id: 4, hospital: "Durdans Hospital", location: "Colombo", type: "Private", icu: true, nicu: true, emergency: true, lab: true, pharmacy: true, parking: false, ambulance: true, wifi: true },
  { id: 5, hospital: "Oasis Hospital", location: "Colombo", type: "Private", icu: true, nicu: false, emergency: true, lab: true, pharmacy: true, parking: true, ambulance: false, wifi: true },
  { id: 6, hospital: "Central Hospital Kandy", location: "Kandy", type: "Government", icu: true, nicu: true, emergency: true, lab: true, pharmacy: true, parking: true, ambulance: true, wifi: false },
  { id: 7, hospital: "Ninewells Hospital", location: "Colombo", type: "Private", icu: false, nicu: false, emergency: true, lab: true, pharmacy: true, parking: true, ambulance: true, wifi: true },
]

const facilityIcons = {
  icu: Heart,
  nicu: Baby,
  emergency: Siren,
  lab: FlaskConical,
  pharmacy: Pill,
  parking: Car,
  ambulance: Truck,
  wifi: Wifi,
}

const facilityColors = {
  icu: { bg: "bg-red-50", icon: "text-red-500", border: "border-red-200" },
  nicu: { bg: "bg-pink-50", icon: "text-pink-500", border: "border-pink-200" },
  emergency: { bg: "bg-orange-50", icon: "text-orange-500", border: "border-orange-200" },
  lab: { bg: "bg-purple-50", icon: "text-purple-500", border: "border-purple-200" },
  pharmacy: { bg: "bg-green-50", icon: "text-green-500", border: "border-green-200" },
  parking: { bg: "bg-blue-50", icon: "text-blue-500", border: "border-blue-200" },
  ambulance: { bg: "bg-amber-50", icon: "text-amber-500", border: "border-amber-200" },
  wifi: { bg: "bg-cyan-50", icon: "text-cyan-500", border: "border-cyan-200" },
}

const facilityLabels = {
  icu: "ICU",
  nicu: "NICU",
  emergency: "Emergency",
  lab: "Laboratory",
  pharmacy: "Pharmacy",
  parking: "Parking",
  ambulance: "Ambulance",
  wifi: "WiFi",
}

export default function FacilitiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)

  const filteredData = facilitiesData.filter(facility => {
    const matchesSearch = facility.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         facility.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = !selectedFilter || facility[selectedFilter as keyof typeof facility] === true
    return matchesSearch && matchesFilter
  })

  const getFacilityCount = (key: string) => facilitiesData.filter(f => f[key as keyof typeof f]).length
  const totalFacilities = Object.keys(facilityLabels).reduce((acc, key) => acc + getFacilityCount(key), 0)

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
          <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white shadow-lg shadow-emerald-500/25">
            <Plus className="w-4 h-4 mr-2" />
            Update Facilities
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {Object.entries(facilityLabels).map(([key, label]) => {
          const Icon = facilityIcons[key as keyof typeof facilityIcons]
          const colors = facilityColors[key as keyof typeof facilityColors]
          const count = getFacilityCount(key)
          const isSelected = selectedFilter === key
          
          return (
            <button
              key={key}
              onClick={() => setSelectedFilter(isSelected ? null : key)}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                isSelected 
                  ? `${colors.border} ${colors.bg} ring-2 ring-offset-2 ring-emerald-500` 
                  : "border-slate-100 bg-white hover:border-emerald-200 hover:shadow-lg"
              }`}
            >
              <div className="p-4">
                <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-slate-800">{count}</p>
                <p className="text-[10px] text-slate-400">of {facilitiesData.length}</p>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Search and Filter Bar */}
      <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
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
            <div className="flex items-center gap-3">
              {selectedFilter && (
                <Badge 
                  variant="secondary" 
                  className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer px-3 py-1.5 rounded-full"
                  onClick={() => setSelectedFilter(null)}
                >
                  {facilityLabels[selectedFilter as keyof typeof facilityLabels]}
                  <X className="w-3 h-3 ml-2" />
                </Badge>
              )}
              <span className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-700">{filteredData.length}</span> hospitals
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facilities Matrix Table */}
      <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50/50 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                <Hospital className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-800">Facility Availability Matrix</CardTitle>
                <CardDescription className="text-slate-500">Check marks indicate available facilities at each hospital</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-white border-emerald-200 text-emerald-700">
              <Sparkles className="w-3 h-3 mr-1" />
              {totalFacilities} Total Facilities
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="font-semibold text-slate-700 pl-6">Hospital</TableHead>
                  {Object.entries(facilityLabels).map(([key, label]) => {
                    const Icon = facilityIcons[key as keyof typeof facilityIcons]
                    const colors = facilityColors[key as keyof typeof facilityColors]
                    return (
                      <TableHead key={key} className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                            <Icon className={`w-4 h-4 ${colors.icon}`} />
                          </div>
                          <span className="text-xs font-medium text-slate-600">{label}</span>
                        </div>
                      </TableHead>
                    )
                  })}
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((facility, idx) => (
                  <TableRow 
                    key={facility.id} 
                    className="hover:bg-emerald-50/30 transition-colors group"
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl flex items-center justify-center text-emerald-700 font-bold text-sm">
                          {facility.hospital.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{facility.hospital}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500">{facility.location}</span>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                              facility.type === 'Private' 
                                ? 'border-blue-200 text-blue-600 bg-blue-50' 
                                : 'border-emerald-200 text-emerald-600 bg-emerald-50'
                            }`}>
                              {facility.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    {Object.keys(facilityLabels).map((key) => {
                      const hasFeature = facility[key as keyof typeof facility]
                      const colors = facilityColors[key as keyof typeof facilityColors]
                      return (
                        <TableCell key={key} className="text-center">
                          {hasFeature ? (
                            <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center mx-auto transition-transform group-hover:scale-110`}>
                              <CheckCircle2 className={`w-5 h-5 ${colors.icon}`} />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mx-auto">
                              <X className="w-4 h-4 text-slate-300" />
                            </div>
                          )}
                        </TableCell>
                      )
                    })}
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-50">
                            <MoreHorizontal className="w-4 h-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="w-4 h-4 mr-2 text-slate-500" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
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
    </div>
  )
}
