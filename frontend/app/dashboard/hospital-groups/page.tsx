"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, Phone, Users } from "lucide-react"

const hospitalGroups = [
  {
    id: 1,
    name: "Asiri Hospital Group",
    hospitals: 8,
    locations: ["Colombo", "Kandy", "Galle", "Negombo"],
    doctors: 245,
    status: "Active",
    specialties: 32,
  },
  {
    id: 2,
    name: "Lanka Hospitals Corporation",
    hospitals: 5,
    locations: ["Colombo", "Panadura", "Gampaha"],
    doctors: 180,
    status: "Active",
    specialties: 28,
  },
  {
    id: 3,
    name: "Nawaloka Hospitals",
    hospitals: 6,
    locations: ["Colombo", "Negombo", "Matara", "Kurunegala"],
    doctors: 165,
    status: "Active",
    specialties: 25,
  },
  {
    id: 4,
    name: "Durdans Hospital",
    hospitals: 3,
    locations: ["Colombo", "Kandy"],
    doctors: 95,
    status: "Active",
    specialties: 22,
  },
  {
    id: 5,
    name: "Oasis Hospital",
    hospitals: 2,
    locations: ["Colombo", "Kalubowila"],
    doctors: 78,
    status: "Active",
    specialties: 18,
  },
]

export default function HospitalGroupsPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hospital Groups</h1>
            <p className="text-gray-600 mt-1">Manage hospital networks and group operations</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Building2 className="w-4 h-4 mr-2" />
            Add Hospital Group
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{hospitalGroups.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Hospitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{hospitalGroups.reduce((acc, group) => acc + group.hospitals, 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{hospitalGroups.reduce((acc, group) => acc + group.doctors, 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{hospitalGroups.filter(g => g.status === "Active").length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitalGroups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <Badge variant="default" className="mt-1">{group.status}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{group.hospitals}</div>
                    <div className="text-xs text-gray-600">Hospitals</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{group.doctors}</div>
                    <div className="text-xs text-gray-600">Doctors</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Locations:</div>
                  <div className="flex flex-wrap gap-1">
                    {group.locations.map((location, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button className="w-full" variant="outline">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
