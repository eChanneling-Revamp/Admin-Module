"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, MapPin } from "lucide-react"
import { useEffect, useState } from "react"
import { hospitalApi, type HospitalGroup } from "@/lib/api/hospitalApi"
import { Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function HospitalGroupsPage() {
  const [groups, setGroups] = useState<HospitalGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await hospitalApi.getGroups()
        setGroups(data)
      } catch (err) {
        setError("Failed to load hospital groups")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hospital Groups</h1>
            <p className="text-gray-600 mt-1">Manage hospital networks and group operations by type</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{groups.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Hospitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{groups.reduce((acc, group) => acc + group.totalHospitals, 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{groups.reduce((acc, group) => acc + group.doctorCount, 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Hospitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {groups.reduce((acc, group) => acc + (group.statusBreakdown?.APPROVED || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg capitalize">{group.hospitalType.toLowerCase().replace('_', ' ')}</CardTitle>
                      <Badge variant="default" className="mt-1">{group.totalHospitals} Hospitals</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{group.totalHospitals}</div>
                    <div className="text-xs text-gray-600">Hospitals</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{group.doctorCount}</div>
                    <div className="text-xs text-gray-600">Doctors</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">My Hospitals:</div>
                  <ScrollArea className="h-32 w-full rounded-md border p-2">
                    <ul className="space-y-1">
                      {group.hospitals.map((hospital) => (
                        <li key={hospital.id} className="text-sm text-gray-600 border-b last:border-0 pb-1 last:pb-0">
                          {hospital.name}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Locations ({group.cities.length}):</div>
                  <div className="flex flex-wrap gap-1">
                    {group.cities.slice(0, 5).map((city, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        {city}
                      </Badge>
                    ))}
                    {group.cities.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{group.cities.length - 5} more
                      </Badge>
                    )}
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
