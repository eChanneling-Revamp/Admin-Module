export interface Branch {
  id: string
  branchName: string
  branchCode: string
  referenceType: "Hospital" | "Agent"
  referenceId: string
  referenceName: string
  address: string
  city: string
  district: string
  contactNumber: string
  email: string
  status: "Active" | "Inactive"
  createdAt: string
  updatedAt: string
}

export interface CreateBranchDto {
  branchName: string
  branchCode: string
  referenceType: "Hospital" | "Agent"
  referenceId: string
  referenceName: string
  address: string
  city: string
  district: string
  contactNumber: string
  email: string
  status: "Active" | "Inactive"
}

export interface UpdateBranchDto extends Partial<CreateBranchDto> {
  id: string
}
