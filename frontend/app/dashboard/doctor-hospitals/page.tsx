"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Hospital, Link2 } from "lucide-react"
import { doctorApi, DoctorHospitalAssignment, DoctorHospitalAssignmentResponse } from "@/lib/api/doctorApi"

const formatNumber = (value: number) => value.toLocaleString("en-US")

const formatStatus = (status: string) =>
  status
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  if (status === "APPROVED") return "default"
  if (status === "REJECTED") return "destructive"
  if (status === "PENDING") return "secondary"
  return "outline"
}

export default function DoctorHospitalsPage() {
  const [assignments, setAssignments] = useState<DoctorHospitalAssignment[]>([])
  const [stats, setStats] = useState<DoctorHospitalAssignmentResponse["stats"]>({
    totalAssignments: 0,
    multiHospitalDoctors: 0,
    activeHospitals: 0,
    weeklySessions: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await doctorApi.getHospitalAssignments()
      setAssignments(response.assignments)
      setStats(response.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load hospital assignments")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  const statCards = useMemo(
    () => [
      { label: "Total Assignments", value: stats.totalAssignments },
      { label: "Multi-Hospital Doctors", value: stats.multiHospitalDoctors },
      { label: "Active Hospitals", value: stats.activeHospitals },
      { label: "Weekly Sessions", value: stats.weeklySessions },
    ],
    [stats]
  )

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hospital Assignments</h1>
            <p className="text-gray-600 mt-1">Manage doctor-hospital relationships and sessions</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Link2 className="w-4 h-4 mr-2" />
            Assign Doctor
          </Button>
        </div>

        {error && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-destructive">Unable to load assignments</p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
              <Button variant="outline" onClick={fetchAssignments} disabled={loading}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Card key={card.label}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">{card.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatNumber(card.value)}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Doctor-Hospital Assignments</CardTitle>
            <CardDescription>Overview of doctors practicing at multiple hospitals</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Primary Hospital</TableHead>
                  <TableHead>Additional Hospitals</TableHead>
                  <TableHead>Weekly Sessions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-gray-500">
                      Loading assignments...
                    </TableCell>
                  </TableRow>
                ) : assignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-gray-500">
                      No hospital assignments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  assignments.map((assignment) => (
                    <TableRow key={assignment.doctorId}>
                      <TableCell className="font-medium">{assignment.doctorName}</TableCell>
                      <TableCell>{assignment.specialization || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Hospital className="w-4 h-4 text-blue-600" />
                          {assignment.primaryHospital ? (
                            <div>
                              <p className="font-medium text-sm">{assignment.primaryHospital.name}</p>
                              <p className="text-xs text-gray-500">
                                {[assignment.primaryHospital.city, assignment.primaryHospital.district]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Not assigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {assignment.additionalHospitals.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {assignment.additionalHospitals.map((hospital) => (
                              <Badge key={hospital.id} variant="outline" className="text-xs w-fit">
                                {hospital.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>{assignment.weeklySessions}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(assignment.status)}>
                          {formatStatus(assignment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" disabled>
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
