"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, LogOut, User, Settings, Menu } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Props {
  setSidebarOpen: (value: boolean) => void
}

export default function TopBar({ setSidebarOpen }: Props) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [notificationCount] = useState(3)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "A"
    return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase()
  }

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 border-b border-cyan-700 shadow-md flex items-center px-4 md:px-6 z-40">

      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Hamburger (mobile only) */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden text-white p-2 rounded-lg hover:bg-white/20 transition"
        >
          <Menu className="w-6 h-6" />
        </button>

        <h2 className="text-white font-semibold text-sm sm:text-base md:text-xl whitespace-nowrap">
          eChannelling Admin Dashboard
        </h2>
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-2 md:gap-4">

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20">
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white flex items-center justify-center">
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>New appointment scheduled</DropdownMenuItem>
            <DropdownMenuItem>Doctor schedule updated</DropdownMenuItem>
            <DropdownMenuItem>New branch registered</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/20 px-2 md:px-3 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/admin.webp" />
                <AvatarFallback>
                  {user ? getInitials(user.firstName, user.lastName) : "A"}
                </AvatarFallback>
              </Avatar>

              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold">
                  {user?.firstName ?? "Admin"}
                </p>
                <p className="text-xs text-cyan-100">
                  {user?.role ?? "Administrator"}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2 text-red-500" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
