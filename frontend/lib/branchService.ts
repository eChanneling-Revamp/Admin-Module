import type { Branch, CreateBranchDto, UpdateBranchDto } from "@/types/branch"

const API_BASE_URL = "/api/branches"

export const branchService = {
  async getAllBranches(): Promise<Branch[]> {
    const response = await fetch(API_BASE_URL)
    if (!response.ok) throw new Error("Failed to fetch branches")
    return response.json()
  },

  async getBranchById(id: string): Promise<Branch> {
    const response = await fetch(`${API_BASE_URL}/${id}`)
    if (!response.ok) throw new Error("Failed to fetch branch")
    return response.json()
  },

  async createBranch(data: CreateBranchDto): Promise<Branch> {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create branch")
    return response.json()
  },

  async updateBranch(data: UpdateBranchDto): Promise<Branch> {
    const response = await fetch(`${API_BASE_URL}/${data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update branch")
    return response.json()
  },

  async deleteBranch(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete branch")
  },

  async searchBranches(query: string): Promise<Branch[]> {
    const response = await fetch(`${API_BASE_URL}?q=${encodeURIComponent(query)}`)
    if (!response.ok) throw new Error("Failed to search branches")
    return response.json()
  },
}
