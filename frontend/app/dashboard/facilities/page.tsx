"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Plus } from "lucide-react"

const facilitiesData = [
  { hospital: "Asiri Hospital Colombo", icu: true, nicu: true, emergency: true, lab: true, pharmacy: true, parking: true, ambulance: true, wifi: true },
  { hospital: "Lanka Hospitals", icu: true, nicu: true, emergency: true, lab: true, pharmacy: true, parking: true, ambulance: true, wifi: true },
  { hospital: "Nawaloka Hospital", icu: true, nicu: false, emergency: true, lab: true, pharmacy: true, parking: true, ambulance: true, wifi: true },
  { hospital: "Durdans Hospital", icu: true, nicu: true, emergency: true, lab: true, pharmacy: true, parking: false, ambulance: true, wifi: true },
  { hospital: "Oasis Hospital", icu: true, nicu: false, emergency: true, lab: true, pharmacy: true, parking: true, ambulance: false, wifi: true },
  { hospital: "Central Hospital Kandy", icu: true, nicu: true, emergency: true, lab: true, pharmacy: true, parking: true, ambulance: true, wifi: false },
  { hospital: "Ninewells Hospital", icu: false, nicu: false, emergency: true, lab: true, pharmacy: true, parking: true, ambulance: true, wifi: true },
]

export default function FacilitiesPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hospital Facilities</h1>
            <p className="text-gray-600 mt-1">Manage and monitor hospital amenities and services</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Update Facilities
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600">ICU</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{facilitiesData.filter(f => f.icu).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600">NICU</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{facilitiesData.filter(f => f.nicu).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600">Emergency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{facilitiesData.filter(f => f.emergency).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600">Lab</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{facilitiesData.filter(f => f.lab).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600">Pharmacy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{facilitiesData.filter(f => f.pharmacy).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600">Parking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{facilitiesData.filter(f => f.parking).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600">Ambulance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{facilitiesData.filter(f => f.ambulance).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600">WiFi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{facilitiesData.filter(f => f.wifi).length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Facility Availability Matrix</CardTitle>
            <CardDescription>Check marks indicate available facilities at each hospital</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hospital</TableHead>
                  <TableHead className="text-center">ICU</TableHead>
                  <TableHead className="text-center">NICU</TableHead>
                  <TableHead className="text-center">Emergency</TableHead>
                  <TableHead className="text-center">Laboratory</TableHead>
                  <TableHead className="text-center">Pharmacy</TableHead>
                  <TableHead className="text-center">Parking</TableHead>
                  <TableHead className="text-center">Ambulance</TableHead>
                  <TableHead className="text-center">WiFi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facilitiesData.map((facility, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{facility.hospital}</TableCell>
                    <TableCell className="text-center">
                      {facility.icu && <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {facility.nicu && <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {facility.emergency && <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {facility.lab && <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {facility.pharmacy && <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {facility.parking && <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {facility.ambulance && <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {facility.wifi && <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
