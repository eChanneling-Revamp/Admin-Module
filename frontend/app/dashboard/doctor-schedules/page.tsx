"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { doctorApi, type DoctorSchedule, type DoctorScheduleQuery } from "@/lib/api/doctorApi"

type FilterState = {
  startDate: string
  endDate: string
  status: string
  search: string
  sortOrder: "asc" | "desc"
}

type FetchOptions = {
  showFullScreenLoader?: boolean
  pageOverride?: number
  pageSizeOverride?: number
}

const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" })
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })
const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" })

const createDefaultFilters = (): FilterState => ({
  startDate: "",
  endDate: "",
  status: "ALL",
  search: "",
  sortOrder: "asc",
})

const statusOptions = [
  { label: "All statuses", value: "ALL" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Ongoing", value: "ONGOING" },
  { label: "Paused", value: "PAUSED" },
  { label: "Ended", value: "ENDED" },
]

const pageSizeOptions = [25, 50, 100]

const formatStatusLabel = (schedule: DoctorSchedule) => {
  if (schedule.isFull) {
    return "Full"
  }

  return schedule.sessionStatus
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .map((segment) => segment.replace(/^\w/, (char) => char.toUpperCase()))
    .join(" ")
}

const getStatusVariant = (schedule: DoctorSchedule): "default" | "secondary" | "destructive" | "outline" => {
  if (schedule.isFull) {
    return "secondary"
  }

  switch (schedule.sessionStatus) {
    case "ONGOING":
      return "default"
    case "PAUSED":
      return "outline"
    case "ENDED":
      return "destructive"
    default:
      return "default"
  }
}

const formatTimeRange = (start: string, end: string) => {
  const startLabel = timeFormatter.format(new Date(start))
  const endLabel = timeFormatter.format(new Date(end))
  return `${startLabel} - ${endLabel}`
}

export default function DoctorSchedulesPage() {
  const [filters, setFilters] = useState<FilterState>(() => createDefaultFilters())
  const [pendingFilters, setPendingFilters] = useState<FilterState>(() => createDefaultFilters())
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 25, total: 0, totalPages: 1 })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initialLoadRef = useRef(true)

  const fetchSchedules = useCallback(async ({ showFullScreenLoader = false, pageOverride, pageSizeOverride }: FetchOptions = {}) => {
    try {
      setError(null)
      if (showFullScreenLoader) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      const pageToLoad = pageOverride ?? page
      const size = pageSizeOverride ?? pageSize

      const query: DoctorScheduleQuery = {
        page: pageToLoad,
        pageSize: size,
        sortOrder: filters.sortOrder,
      }

      if (filters.status && filters.status !== "ALL") {
        query.status = filters.status
      }
      if (filters.search.trim()) {
        query.search = filters.search.trim()
      }
      if (filters.startDate) {
        query.startDate = new Date(filters.startDate).toISOString()
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate)
        end.setHours(23, 59, 59, 999)
        query.endDate = end.toISOString()
      }

      const result = await doctorApi.getSchedules(query)

      setSchedules(result?.schedules ?? [])
      if (result?.pagination) {
        setPagination(result.pagination)

        if (result.pagination.totalPages > 0 && pageToLoad > result.pagination.totalPages) {
          setPage(result.pagination.totalPages)
          return
        }
      } else {
        setPagination({
          page: pageToLoad,
          pageSize: size,
          total: result?.schedules?.length ?? 0,
          totalPages: 1,
        })
      }
    } catch (err) {
      console.error("DoctorSchedulesPage: Failed to load schedules", err)
      setError("Unable to load doctor schedules. Please try again.")
      setSchedules([])
    } finally {
      if (showFullScreenLoader) {
        setLoading(false)
      } else {
        setRefreshing(false)
      }
    }
  }, [filters, page, pageSize])

  useEffect(() => {
    fetchSchedules({ showFullScreenLoader: initialLoadRef.current })
    if (initialLoadRef.current) {
      initialLoadRef.current = false
    }
  }, [fetchSchedules])

  const metrics = useMemo(() => {
    const todayKey = new Date().toDateString()
    const todaysSessions = schedules.filter(
      (schedule) => new Date(schedule.scheduledAt).toDateString() === todayKey
    ).length

    const totals = schedules.reduce(
      (acc, schedule) => {
        acc.capacity += schedule.capacity
        acc.booked += schedule.booked
        acc.available += schedule.available
        return acc
      },
      { capacity: 0, booked: 0, available: 0 }
    )

    const bookingRate = totals.capacity ? Math.round((totals.booked / totals.capacity) * 100) : 0

    return {
      totalSchedules: pagination.total,
      todaysSessions,
      availableSlots: totals.available,
      bookingRate,
    }
  }, [schedules, pagination.total])

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setPendingFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleApplyFilters = () => {
    setFilters(pendingFilters)
    setPage(1)
  }

  const handleResetFilters = () => {
    const defaults = createDefaultFilters()
    setPendingFilters(defaults)
    setFilters(defaults)
    setPage(1)
  }

  const handlePageChange = (direction: "previous" | "next") => {
    setPage((current) => {
      if (direction === "previous") {
        return Math.max(current - 1, 1)
      }
      return Math.min(current + 1, pagination.totalPages)
    })
  }

  const handlePageSizeChange = (value: string) => {
    const size = Number(value)
    setPageSize(size)
    setPage(1)
  }

  const startIndex = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1
  const endIndex = pagination.total === 0 ? 0 : Math.min(pagination.page * pagination.pageSize, pagination.total)

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-blue-600" />
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Schedules</h1>
            <p className="text-gray-600 mt-1">Review every scheduled session with historical context and live filters.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => fetchSchedules()} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Calendar className="w-4 h-4 mr-2" />
              Create Schedule
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-3 text-sm text-red-700 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <span>{error}</span>
              <Button size="sm" variant="outline" onClick={() => fetchSchedules()} disabled={refreshing}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Refine schedules by date range, status, and keyword.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-search">Search</Label>
                <Input
                  id="schedule-search"
                  placeholder="Doctor, hospital, or specialty"
                  value={pendingFilters.search}
                  onChange={(event) => handleFilterChange("search", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-start">Start date</Label>
                <Input
                  id="schedule-start"
                  type="date"
                  value={pendingFilters.startDate}
                  onChange={(event) => handleFilterChange("startDate", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-end">End date</Label>
                <Input
                  id="schedule-end"
                  type="date"
                  value={pendingFilters.endDate}
                  onChange={(event) => handleFilterChange("endDate", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={pendingFilters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value || "all"} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sort by date</Label>
                <Select value={pendingFilters.sortOrder} onValueChange={(value) => handleFilterChange("sortOrder", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ascending" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Oldest first</SelectItem>
                    <SelectItem value="desc">Newest first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:justify-end">
              <Button variant="outline" onClick={handleResetFilters} disabled={refreshing}>
                Reset
              </Button>
              <Button className="bg-blue-600" onClick={handleApplyFilters} disabled={refreshing}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.totalSchedules}</div>
              <p className="text-xs text-gray-500 mt-1">Across applied filters</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Today's Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{metrics.todaysSessions}</div>
              <p className="text-xs text-gray-500 mt-1">Based on current page</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Available Slots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.availableSlots}</div>
              <p className="text-xs text-gray-500 mt-1">Remaining this page</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Booking Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{metrics.bookingRate}%</div>
              <p className="text-xs text-gray-500 mt-1">Confirmed vs available</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Schedules</CardTitle>
            <CardDescription>Explore every session, past and upcoming, with full filtering.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
              <p className="text-sm text-gray-600">
                Showing {startIndex === 0 ? 0 : `${startIndex}-${endIndex}`} of {pagination.total} schedules.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wide text-gray-500">Rows per page</span>
                <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Booked</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-sm text-gray-500 py-6">
                      No schedules match the selected filters.
                    </TableCell>
                  </TableRow>
                )}
                {schedules.map((schedule) => {
                  const scheduledDate = new Date(schedule.scheduledAt)

                  return (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.doctorName}</TableCell>
                      <TableCell>{schedule.specialization}</TableCell>
                      <TableCell>
                        {schedule.hospitalName}
                        {schedule.hospitalCity ? `, ${schedule.hospitalCity}` : ""}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{weekdayFormatter.format(scheduledDate)}</span>
                          <span className="text-xs text-gray-500">{dateFormatter.format(scheduledDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeRange(schedule.startTime, schedule.endTime)}
                        </div>
                      </TableCell>
                      <TableCell>{schedule.capacity}</TableCell>
                      <TableCell>{schedule.booked}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(schedule)}>{formatStatusLabel(schedule)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handlePageChange("previous")} disabled={pagination.page <= 1}>
                  Previous
                </Button>
                <Button variant="outline" onClick={() => handlePageChange("next")} disabled={pagination.page >= pagination.totalPages}>
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  )
}
