import type { Branch, CreateBranchDto, UpdateBranchDto } from "@/types/branch"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set')
}

const BRANCH_API_BASE = `${API_BASE_URL}/api/branches`

export const branchService = {
  async getAllBranches(): Promise<Branch[]> {
    const response = await fetch(BRANCH_API_BASE)
    if (!response.ok) throw new Error("Failed to fetch branches")
    return response.json()
  },

  async getBranchById(id: string): Promise<Branch> {
    const response = await fetch(`${BRANCH_API_BASE}/${id}`)
    if (!response.ok) throw new Error("Failed to fetch branch")
    return response.json()
  },

  async createBranch(data: CreateBranchDto): Promise<Branch> {
    const response = await fetch(BRANCH_API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create branch")
    return response.json()
  },

  async updateBranch(data: UpdateBranchDto): Promise<Branch> {
    const response = await fetch(`${BRANCH_API_BASE}/${data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update branch")
    return response.json()
  },

  async deleteBranch(id: string): Promise<void> {
    const response = await fetch(`${BRANCH_API_BASE}/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete branch")
  },

  async searchBranches(query: string): Promise<Branch[]> {
    const response = await fetch(`${BRANCH_API_BASE}?q=${encodeURIComponent(query)}`)
    if (!response.ok) throw new Error("Failed to search branches")
    return response.json()
  },
}
