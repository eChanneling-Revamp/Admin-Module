"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, Building2, Loader2, MapPin, Users } from "lucide-react"
import { hospitalApi, type HospitalGroup, type HospitalStatus } from "@/lib/api/hospitalApi"

const STATUS_ORDER: HospitalStatus[] = ["APPROVED", "PENDING", "REJECTED"]

const STATUS_BADGE_STYLES: Record<HospitalStatus, string> = {
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  REJECTED: "bg-rose-100 text-rose-700 border-rose-200",
}

const STATUS_BAR_STYLES: Record<HospitalStatus, string> = {
  APPROVED: "bg-emerald-500",
  PENDING: "bg-amber-500",
  REJECTED: "bg-rose-500",
}

export default function HospitalGroupsPage() {
  const [groups, setGroups] = useState<HospitalGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadGroups = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await hospitalApi.getGroups()
      setGroups(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load hospital groups")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  const summary = useMemo(() => {
    const statusTotals: Record<HospitalStatus, number> = {
      APPROVED: 0,
      PENDING: 0,
      REJECTED: 0,
    }

    let totalHospitals = 0
    let totalDoctors = 0
    const districtSet = new Set<string>()

    groups.forEach((group) => {
      totalHospitals += group.totalHospitals
      totalDoctors += group.doctorCount
      group.districts.forEach((district) => {
        districtSet.add(district)
      })
      STATUS_ORDER.forEach((status) => {
        statusTotals[status] += group.statusBreakdown[status] || 0
      })
    })

    return {
      totalHospitals,
      totalDoctors,
      districtCount: districtSet.size,
      statusTotals,
    }
  }, [groups])

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hospital Groups</h1>
            <p className="text-gray-600 mt-1">Live view of government vs private networks and their hospital performance</p>
          </div>
          <Button onClick={loadGroups} variant="outline" disabled={loading} className="w-full md:w-auto">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Building2 className="w-4 h-4 mr-2" />}
            Refresh Data
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Groups</CardTitle>
              <CardDescription>Segmented by ownership (gov vs private)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{groups.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Hospitals Managed</CardTitle>
              <CardDescription>Across both ownership categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{summary.totalHospitals}</div>
              <p className="text-xs text-gray-500 mt-1">{summary.totalDoctors} linked doctors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Approved Hospitals</CardTitle>
              <CardDescription>Ready for booking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700">{summary.statusTotals.APPROVED}</div>
              <p className="text-xs text-gray-500 mt-1">{groups.length ? `${Math.round((summary.statusTotals.APPROVED / Math.max(summary.totalHospitals, 1)) * 100)}% of inventory` : ""}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">District Coverage</CardTitle>
              <CardDescription>Unique districts represented</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">{summary.districtCount}</div>
              <p className="text-xs text-gray-500 mt-1">{summary.statusTotals.PENDING} hospitals pending review</p>
            </CardContent>
          </Card>
        </div>

        {loading && (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 py-16">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Unable to load hospital groups</p>
              <p className="text-sm">{error}</p>
              <Button variant="link" className="mt-2 px-0" onClick={loadGroups}>
                Try again
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && groups.length === 0 && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>No hospital groups found</CardTitle>
              <CardDescription>Add hospitals with a district, type, and status to see grouped insights.</CardDescription>
            </CardHeader>
          </Card>
        )}

        {!loading && !error && groups.length > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => {
              const leadingHospitals = group.hospitals.slice(0, 4)

              return (
                <Card key={group.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{group.hospitalType}</CardTitle>
                          <CardDescription className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-3.5 w-3.5" />
                            {group.districtCount} district{group.districtCount === 1 ? '' : 's'} covered
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs uppercase tracking-wide">
                        {group.totalHospitals} hospitals
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Hospitals</p>
                        <p className="text-xl font-semibold text-blue-700">{group.totalHospitals}</p>
                      </div>
                      <div>
                        <p className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="h-3.5 w-3.5" /> Doctors
                        </p>
                        <p className="text-xl font-semibold text-emerald-700">{group.doctorCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Facilities</p>
                        <p className="text-xl font-semibold text-indigo-700">{group.facilityCount}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status mix</p>
                      {STATUS_ORDER.map((status) => {
                        const value = group.statusBreakdown[status] || 0
                        const percentage = group.totalHospitals
                          ? Math.round((value / group.totalHospitals) * 100)
                          : 0

                        return (
                          <div key={`${group.id}-${status}`} className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>{status}</span>
                              <span>
                                {value} ({percentage}%)
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-gray-100">
                              <div
                                className={`h-full rounded-full ${STATUS_BAR_STYLES[status]}`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {group.districts.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">District coverage</p>
                        <div className="flex flex-wrap gap-1">
                          {group.districts.slice(0, 6).map((district) => (
                            <Badge key={district} variant="outline" className="text-xs">
                              <MapPin className="mr-1 h-3 w-3" />
                              {district}
                            </Badge>
                          ))}
                          {group.districts.length > 6 && (
                            <span className="text-xs text-gray-500">
                              +{group.districts.length - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Top hospitals</p>
                      <div className="space-y-2">
                        {leadingHospitals.map((hospital) => (
                          <div
                            key={hospital.id}
                            className="flex items-center justify-between rounded-md border border-gray-100 p-2"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">{hospital.name}</p>
                              <p className="text-xs text-gray-500">{hospital.city}</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs ${STATUS_BADGE_STYLES[hospital.status]}`}
                            >
                              {hospital.status}
                            </Badge>
                          </div>
                        ))}
                        {group.totalHospitals > leadingHospitals.length && (
                          <p className="text-xs text-gray-500">
                            +{group.totalHospitals - leadingHospitals.length} more hospitals in this type
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}
