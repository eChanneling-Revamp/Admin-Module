import type { Branch, CreateBranchDto, UpdateBranchDto } from "@/types/branch"

const API_BASE_URL = "/api/branches"

export const branchService = {

  async getAllBranches(token?: string): Promise<Branch[]> {
    const response = await fetch(API_BASE_URL, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    if (!response.ok) throw new Error("Failed to fetch branches")
    const result = await response.json()
    return (result.data as any[]).map((b) => ({
      id: b.id,
      branchName: b.name ?? "-",
      branchCode: b.code ?? "-",
      referenceType: b.type ? (b.type === "HOSPITAL" ? "Hospital" : "Agent") : "-",
      referenceId: "-",
      referenceName: b.referenceName || undefined,
      address: b.address ?? "-",
      city: b.city ?? "-",
      district: b.district ?? "-",
      contactNumber: b.phone ?? "-",
      email: b.email ?? "-",
      status: b.status === true ? "Active" : "Inactive",
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }))
  },


  async getBranchById(id: string, token?: string): Promise<Branch> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    if (!response.ok) throw new Error("Failed to fetch branch")
    return response.json()
  },


  async createBranch(data: CreateBranchDto, token?: string): Promise<Branch> {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create branch")
    return response.json()
  },


  async updateBranch(data: UpdateBranchDto, token?: string): Promise<Branch> {
    const response = await fetch(`${API_BASE_URL}/${data.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update branch")
    return response.json()
  },


  async deleteBranch(id: string, token?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    if (!response.ok) throw new Error("Failed to delete branch")
  },

  async searchBranches(query: string, token?: string): Promise<Branch[]> {
    const response = await fetch(`${API_BASE_URL}?q=${encodeURIComponent(query)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    if (!response.ok) throw new Error("Failed to search branches")
    const result = await response.json()
    return (result.data as any[]).map((b) => ({
      id: b.id,
      branchName: b.name ?? "-",
      branchCode: b.code ?? "-",
      referenceType: b.type ? (b.type === "HOSPITAL" ? "Hospital" : "Agent") : "-",
      referenceId: "-",
      referenceName: "-",
      address: b.address ?? "-",
      city: b.city ?? "-",
      district: b.district ?? "-",
      contactNumber: b.phone ?? "-",
      email: b.email ?? "-",
      status: b.status === true ? "Active" : "Inactive",
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }))
  },
}
