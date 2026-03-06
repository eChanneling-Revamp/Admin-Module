"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Plus, Loader2 } from "lucide-react"
import { userApi, UserStats } from "@/lib/api/userApi"
import { useToast } from "@/components/ui/use-toast"

// Static definitions for role metadata (descriptions, permissions) based on UserRole enum in Prisma schema
const STATIC_ROLE_DEFINITIONS: Record<string, {
  permissions: string[];
  description: string;
  name: string; // Display name
}> = {
  "ADMIN": {
    name: "Administrator",
    permissions: ["Full System Access", "User Management", "System Configuration"],
    description: "Complete system control and administration"
  },
  "SUPERVISOR": {
    name: "Supervisor",
    permissions: ["Staff Management", "View Reports", "Override Controls"],
    description: "Team oversight and management"
  },
  "AGENT": {
    name: "Agent",
    permissions: ["Patient Registration", "Book Appointments", "View Commission"],
    description: "Field agent and booking access"
  },
  "CORPORATE": {
    name: "Corporate",
    permissions: ["Corporate Dashboard", "Employee Management", "Booking Access"],
    description: "Corporate account management"
  },
  "PATIENT": {
    name: "Patient",
    permissions: ["My Profile", "Book Appointments", "Medical History"],
    description: "Standard end-user access"
  }
}

// Helper to normalize role keys
const normalizeRoleKey = (key: string) => {
  // Try direct match
  if (STATIC_ROLE_DEFINITIONS[key]) return key;

  // Try uppercase (API likely returns uppercase for enums)
  const upper = key.toUpperCase();
  if (STATIC_ROLE_DEFINITIONS[upper]) return upper;

  return null;
}

interface RoleDisplayData {
  id: string;
  name: string;
  users: number;
  permissions: string[];
  description: string;
  isCustom?: boolean;
}

export default function RolesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [roles, setRoles] = useState<RoleDisplayData[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await userApi.getStats();
      setStats(data);

      // Transform API role counts into display data
      const processedRoles: RoleDisplayData[] = [];

      // Process each role returned from API
      Object.entries(data.byRole).forEach(([roleKey, count]) => {
        const normalizedKey = normalizeRoleKey(roleKey);
        const def = normalizedKey ? STATIC_ROLE_DEFINITIONS[normalizedKey] : null;

        if (def) {
          processedRoles.push({
            id: normalizedKey!,
            name: def.name,
            users: count,
            permissions: def.permissions,
            description: def.description,
            isCustom: false
          });
        } else {
          // Fallback for unknown roles from API
          processedRoles.push({
            id: roleKey,
            name: roleKey, // Best guess display name
            users: count,
            permissions: ["Basic Access"],
            description: "Custom or undefined role",
            isCustom: true
          });
        }
      });

      // Add defined roles with 0 users if they weren't in the API response (optional, but good for completeness)
      Object.entries(STATIC_ROLE_DEFINITIONS).forEach(([key, def]) => {
        if (!processedRoles.find(r => r.id === key)) {
          processedRoles.push({
            id: key,
            name: def.name,
            users: 0,
            permissions: def.permissions,
            description: def.description,
            isCustom: false
          });
        }
      });

      // Sort by user count desc, then name
      processedRoles.sort((a, b) => b.users - a.users || a.name.localeCompare(b.name));

      setRoles(processedRoles);
    } catch (error) {
      console.error("Failed to fetch role stats:", error);
      toast({
        title: "Error",
        description: "Failed to load role data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const totalUsers = stats?.total || 0;
  const activeRolesCount = roles.filter(r => r.users > 0).length;
  // Count assuming non-standard keys in API are "custom"
  const customRolesCount = roles.filter(r => r.isCustom).length;

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roles & Privileges</h1>
            <p className="text-gray-600 mt-1">Manage user roles and access permissions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{roles.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeRolesCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Custom Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{customRolesCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Roles</CardTitle>
            <CardDescription>Define and manage access control for different user types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{role.name}</h3>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {role.permissions.map((permission, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-blue-600">{role.users}</div>
                      <div className="text-xs text-gray-600">users</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
