"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, MapPin, PencilLine, RefreshCw, X } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { hospitalApi, type Hospital } from "@/lib/api/hospitalApi"
import { useToast } from "@/hooks/use-toast"

type FacilityStat = {
  name: string
  count: number
}

export default function FacilitiesPage() {
  const { toast } = useToast()
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])
  const [newFacility, setNewFacility] = useState("")
  const [saving, setSaving] = useState(false)

  const loadHospitals = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await hospitalApi.getAll()
      setHospitals(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load hospitals")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHospitals()
  }, [loadHospitals])

  const facilityStats = useMemo(() => {
    const frequency = new Map<string, number>()

    hospitals.forEach((hospital) => {
      hospital.facilities?.forEach((facility) => {
        const key = facility.trim()
        if (!key) return
        frequency.set(key, (frequency.get(key) || 0) + 1)
      })
    })

    const sorted: FacilityStat[] = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))

    return {
      totalHospitals: hospitals.length,
      uniqueFacilities: frequency.size,
      facilityCards: sorted.slice(0, 8),
      availableFacilities: Array.from(frequency.keys()).sort(),
    }
  }, [hospitals])

  const openFacilitiesModal = (hospital: Hospital) => {
    setSelectedHospital(hospital)
    setSelectedFacilities(hospital.facilities || [])
    setNewFacility("")
    setDialogOpen(true)
  }

  const toggleFacility = (facility: string) => {
    const normalized = facility.trim()
    if (!normalized) return
    setSelectedFacilities((prev) =>
      prev.includes(normalized)
        ? prev.filter((item) => item !== normalized)
        : [...prev, normalized]
    )
  }

  const handleAddFacility = () => {
    const normalized = newFacility.trim()
    if (!normalized) return
    setSelectedFacilities((prev) =>
      prev.includes(normalized) ? prev : [...prev, normalized]
    )
    setNewFacility("")
  }

  const handleRemoveFacility = (facility: string) => {
    setSelectedFacilities((prev) => prev.filter((item) => item !== facility))
  }

  const handleSaveFacilities = async () => {
    if (!selectedHospital) return
    const payload = Array.from(new Set(selectedFacilities.map((facility) => facility.trim()))).filter(Boolean)

    setSaving(true)
    try {
      const updated = await hospitalApi.updateFacilities(selectedHospital.id, payload)
      setHospitals((prev) => prev.map((hospital) => (hospital.id === updated.id ? updated : hospital)))
      toast({
        title: "Facilities updated",
        description: `${updated.name} now lists ${updated.facilities.length} facilities.`,
      })
      setDialogOpen(false)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: err instanceof Error ? err.message : "Unable to update facilities",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setSelectedHospital(null)
      setSelectedFacilities([])
      setNewFacility("")
      setSaving(false)
    }
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hospital Facilities</h1>
            <p className="text-gray-600 mt-1">Live facility inventory sourced from your hospital directory</p>
          </div>
          <Button variant="outline" onClick={loadHospitals} disabled={loading} className="w-full md:w-auto">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh data
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total hospitals</CardTitle>
              <CardDescription>Tracked facilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{facilityStats.totalHospitals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Unique facilities</CardTitle>
              <CardDescription>Across the network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-700">{facilityStats.uniqueFacilities}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Top facility</CardTitle>
              <CardDescription>Most common service</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-emerald-700">
                {facilityStats.facilityCards[0]?.name ?? "—"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {facilityStats.facilityCards[0]?.count ? `${facilityStats.facilityCards[0].count} hospitals` : "No data"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Needs attention</CardTitle>
              <CardDescription>Hospitals without facilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-rose-600">
                {hospitals.filter((hospital) => hospital.facilities.length === 0).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Facility inventory</CardTitle>
            <CardDescription>Review each hospital and update facilities directly.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            )}

            {!loading && error && (
              <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Failed to load hospitals</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && hospitals.length === 0 && (
              <p className="text-sm text-gray-500">No hospitals available. Add hospitals to manage facilities.</p>
            )}

            {!loading && !error && hospitals.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hospital</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Facilities</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hospitals.map((hospital) => (
                      <TableRow key={hospital.id}>
                        <TableCell className="font-semibold">{hospital.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-3.5 w-3.5" />
                            {hospital.city}, {hospital.district}
                          </div>
                        </TableCell>
                        <TableCell>
                          {hospital.facilities.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {hospital.facilities.map((facility) => (
                                <Badge key={`${hospital.id}-${facility}`} variant="outline" className="text-xs">
                                  {facility}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">No facilities listed</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={hospital.status === "APPROVED" ? "default" : "secondary"} className="text-xs">
                            {hospital.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openFacilitiesModal(hospital)}
                          >
                            <PencilLine className="mr-2 h-4 w-4" />
                            Update
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Update facilities</DialogTitle>
            <DialogDescription>
              {selectedHospital ? `Editing facilities for ${selectedHospital.name}.` : "Select a hospital to continue."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Preset facilities</p>
              <div className="flex flex-wrap gap-2 rounded-md border border-dashed border-gray-200 p-3">
                {facilityStats.availableFacilities.length > 0 ? (
                  facilityStats.availableFacilities.map((facility) => {
                    const isActive = selectedFacilities.includes(facility)
                    return (
                      <button
                        key={facility}
                        type="button"
                        onClick={() => toggleFacility(facility)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                          isActive
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {facility}
                      </button>
                    )
                  })
                ) : (
                  <p className="text-sm text-gray-500">No presets yet. Add facilities below.</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add a new facility"
                value={newFacility}
                onChange={(event) => setNewFacility(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    handleAddFacility()
                  }
                }}
              />
              <Button type="button" onClick={handleAddFacility} disabled={!newFacility.trim()}>
                Add
              </Button>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Selected facilities</p>
              {selectedFacilities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedFacilities.map((facility) => (
                    <Badge key={facility} variant="secondary" className="flex items-center gap-1 text-xs">
                      {facility}
                      <button type="button" onClick={() => handleRemoveFacility(facility)} aria-label={`Remove ${facility}`} className="text-gray-500 hover:text-gray-900">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No facilities selected yet.</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveFacilities} disabled={saving || !selectedHospital}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedLayout>
  )
}
