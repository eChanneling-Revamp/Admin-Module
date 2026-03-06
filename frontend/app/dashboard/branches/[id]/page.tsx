"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, MapPin, Phone, Mail, Building2 } from "lucide-react"
import { branchService } from "@/lib/branchService"
import { useToast } from "@/hooks/use-toast"
import type { Branch } from "@/types/branch"
import { BranchModal } from "@/components/branches/BranchModal"

export default function BranchDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [branch, setBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const loadBranch = async () => {
    try {
      setLoading(true)
      const data = await branchService.getBranchById(params.id)
      setBranch(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load branch details",
        variant: "destructive",
      })
      router.push("/dashboard/branches")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBranch()
  }, [params.id])

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading branch details...</div>
      </div>
    )
  }

  if (!branch) {
    return null
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{branch.branchName}</h1>
              <p className="text-gray-500 mt-1">Branch Code: {branch.branchCode}</p>
            </div>
          </div>
          <Button onClick={() => setModalOpen(true)} className="bg-teal-600 hover:bg-teal-700">
            <Edit className="w-4 h-4 mr-2" />
            Edit Branch
          </Button>
        </div>

        {/* Branch Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Branch Name</p>
                <p className="font-medium">{branch.branchName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Branch Code</p>
                <p className="font-medium">{branch.branchCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={branch.status === "Active" ? "default" : "secondary"}>{branch.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">{new Date(branch.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{new Date(branch.updatedAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Reference Information */}
          <Card>
            <CardHeader>
              <CardTitle>Reference Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Reference Type</p>
                <Badge variant={branch.referenceType === "Hospital" ? "default" : "secondary"}>
                  <Building2 className="w-3 h-3 mr-1" />
                  {branch.referenceType}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reference ID</p>
                <p className="font-medium">{branch.referenceId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reference Name</p>
                <p className="font-medium">{branch.referenceName}</p>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </p>
                <p className="font-medium">{branch.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium">{branch.city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">District</p>
                  <p className="font-medium">{branch.district}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact Number
                </p>
                <p className="font-medium">{branch.contactNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </p>
                <p className="font-medium">{branch.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BranchModal open={modalOpen} onClose={() => setModalOpen(false)} branch={branch} onSuccess={loadBranch} />
    </div>
  )
}
