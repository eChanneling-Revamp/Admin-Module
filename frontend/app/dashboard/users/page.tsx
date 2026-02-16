"use client"

import { useState, useEffect } from "react"
import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Search, UserPlus, MoreVertical, Edit, Trash2 } from "lucide-react"
import { userApi, type User, type UserQueryParams, type CreateUserData, type UpdateUserData } from "@/lib/api/userApi"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<CreateUserData>({
    email: "",
    password: "",
    name: "",
    role: "ADMIN",
  })
  const [editFormData, setEditFormData] = useState<UpdateUserData>({
    name: "",
    role: "ADMIN",
    isActive: true,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const roleOptions = ["ADMIN", "SUPERVISOR", "AGENT", "CORPORATE", "PATIENT"]

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async (params?: UserQueryParams) => {
    try {
      setLoading(true)
      const data = await userApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        ...params
      })
      setUsers(data.users || [])
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages
      })
    } catch (error) {
      console.error("Error fetching users:", error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchUsers({ search: value || undefined, page: 1 })
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    
    try {
      await userApi.delete(id)
      await fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await userApi.toggleStatus(id)
      await fetchUsers()
    } catch (error) {
      console.error("Error toggling user status:", error)
    }
  }

  const handleAddUser = async () => {
    try {
      await userApi.create({
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name?.trim() || undefined,
        role: formData.role,
      })
      await fetchUsers()
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error creating user:", error)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) {
      return
    }

    try {
      await userApi.update(selectedUser.id, {
        name: editFormData.name?.trim() || undefined,
        role: editFormData.role,
        isActive: editFormData.isActive,
      })
      await fetchUsers()
      setIsEditDialogOpen(false)
      resetEditForm()
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setEditFormData({
      name: user.name || "",
      role: user.role,
      isActive: user.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      name: "",
      role: "ADMIN",
    })
  }

  const resetEditForm = () => {
    setSelectedUser(null)
    setEditFormData({
      name: "",
      role: "ADMIN",
      isActive: true,
    })
  }

  const stats = {
    total: pagination.total,
    active: users.filter(u => u.isActive).length,
  }

  if (loading && users.length === 0) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-cyan-600" />
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage all system users and their permissions</p>
          </div>
          <Dialog
            open={isAddDialogOpen}
            onOpenChange={(open) => {
              setIsAddDialogOpen(open)
              if (open) {
          resetForm()
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
          <UserPlus className="w-4 h-4 mr-2" />
          Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>Enter user details to add to the system</DialogDescription>
              </DialogHeader>
              <UserForm formData={formData} setFormData={setFormData} roleOptions={roleOptions} />
              <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddUser} className="bg-blue-600">
            Add User
          </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-600 mt-1">Registered users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-gray-600 mt-1">Currently active</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Total {stats.total} users in the system</CardDescription>
              </div>
              <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search users..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name || 'N/A'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {user.lastLoginAt 
                        ? new Date(user.lastLoginAt).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {user.isActive ? 'Disable' : 'Enable'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} users
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => {
                      const newPage = pagination.page - 1
                      setPagination(prev => ({ ...prev, page: newPage }))
                      fetchUsers({ page: newPage })
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => {
                      const newPage = pagination.page + 1
                      setPagination(prev => ({ ...prev, page: newPage }))
                      fetchUsers({ page: newPage })
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            resetEditForm()
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details and permissions</DialogDescription>
          </DialogHeader>
          <EditUserForm
            formData={editFormData}
            setFormData={setEditFormData}
            roleOptions={roleOptions}
            selectedUser={selectedUser}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditUser} className="bg-blue-600">
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedLayout>
  )
}

function UserForm({
  formData,
  setFormData,
  roleOptions,
}: {
  formData: CreateUserData
  setFormData: React.Dispatch<React.SetStateAction<CreateUserData>>
  roleOptions: string[]
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <Label>Email *</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="user@echannelling.lk"
          autoComplete="off"
        />
      </div>
      <div className="col-span-2">
        <Label>Password *</Label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
      </div>
      <div>
        <Label>Name</Label>
        <Input
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Jane Doe"
        />
      </div>
      <div>
        <Label>Role</Label>
        <Select
          value={formData.role || ""}
          onValueChange={(value) => setFormData({ ...formData, role: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function EditUserForm({
  formData,
  setFormData,
  roleOptions,
  selectedUser,
}: {
  formData: UpdateUserData
  setFormData: React.Dispatch<React.SetStateAction<UpdateUserData>>
  roleOptions: string[]
  selectedUser: User | null
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <Label>Email</Label>
        <Input
          type="email"
          value={selectedUser?.email || ""}
          readOnly
          disabled
        />
      </div>
      <div>
        <Label>Name</Label>
        <Input
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Jane Doe"
        />
      </div>
      <div>
        <Label>Role</Label>
        <Select
          value={formData.role || ""}
          onValueChange={(value) => setFormData({ ...formData, role: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          checked={!!formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label>Active Status</Label>
      </div>
    </div>
  )
}
