"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { userApi, type CreateUserData, type UpdateUserData, type User } from "@/lib/api/userApi"

interface UserModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  user?: User | null
}

const ROLE_OPTIONS: Array<{ label: string; value: User["role"] }> = [
  { label: "Admin", value: "ADMIN" },
  { label: "Supervisor", value: "SUPERVISOR" },
  { label: "Agent", value: "AGENT" },
  { label: "Corporate", value: "CORPORATE" },
  { label: "Patient", value: "PATIENT" },
]

const createDefaultFormState = () => ({
  name: "",
  email: "",
  password: "",
  role: ROLE_OPTIONS[0].value,
  isActive: true,
})

export function UserModal({ open, onClose, onSuccess, user }: UserModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(createDefaultFormState)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email,
        password: "",
        role: user.role,
        isActive: user.isActive,
      })
    } else {
      setFormData(createDefaultFormState())
    }
  }, [user, open])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    try {
      if (user) {
        const payload: UpdateUserData = {
          name: formData.name || undefined,
          role: formData.role,
          isActive: formData.isActive,
        }
        await userApi.update(user.id, payload)
        toast({ title: "Success", description: "User updated successfully" })
      } else {
        const payload: CreateUserData = {
          email: formData.email,
          password: formData.password,
          name: formData.name || undefined,
          role: formData.role,
        }
        await userApi.create(payload)
        toast({ title: "Success", description: "User created successfully" })
      }

      onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save user",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const dialogTitle = useMemo(() => (user ? "Edit User" : "Create New User"), [user])

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="jane@example.com"
              value={formData.email}
              onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
              required
              disabled={Boolean(user)}
            />
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                required
                minLength={8}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value as User["role"] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((roleOption) => (
                  <SelectItem key={roleOption.value} value={roleOption.value}>
                    {roleOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {user && (
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label className="text-sm font-medium">Active</Label>
                <p className="text-sm text-muted-foreground">Toggle to enable or disable account access</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Saving..." : user ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
