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
import { Bell, LogOut, User, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export function TopBar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [notificationCount] = useState(3)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="h-16 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 border-b border-cyan-700 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10 shadow-md">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-white">eChannelling Admin Dashboard</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-cyan-700/50 text-white">
              <Bell className="w-5 h-5 text-white" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start py-3">
                <p className="font-medium text-sm">New appointment scheduled</p>
                <p className="text-xs text-gray-500">Patient ID: PT-1001 • 2 hours ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start py-3">
                <p className="font-medium text-sm">Doctor schedule updated</p>
                <p className="text-xs text-gray-500">Dr. Smith • 4 hours ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start py-3">
                <p className="font-medium text-sm">New branch registered</p>
                <p className="text-xs text-gray-500">Galle Branch • 1 day ago</p>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu with Admin Icon */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-3 hover:bg-white/20 text-white transition-all duration-300 rounded-full px-3 py-2 hover:shadow-lg"
            >
              <Avatar className="h-10 w-10 ring-2 ring-white/60 hover:ring-white hover:ring-4 transition-all duration-300 cursor-pointer shadow-lg">
                <AvatarImage src="/admin.webp" alt={user?.name || "Admin"} className="object-cover" />
                <AvatarFallback className="bg-white text-cyan-700 font-bold text-base">
                  {user ? getInitials(user.name) : "A"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-white drop-shadow-md">{user?.name || "Admin User"}</p>
                <p className="text-xs text-cyan-50 capitalize font-medium">{user?.role || "Administrator"}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-72 p-2 shadow-2xl border-2 border-cyan-100 animate-in slide-in-from-top-2 duration-300"
          >
            <DropdownMenuLabel className="font-normal p-0 mb-2">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 rounded-lg border border-cyan-100">
                <Avatar className="h-14 w-14 ring-2 ring-cyan-400 shadow-md">
                  <AvatarImage src="/admin.webp" alt={user?.name || "Admin"} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-teal-600 text-white font-bold text-lg">
                    {user ? getInitials(user.name) : "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1">
                  <p className="text-base font-bold text-gray-900">{user?.name || "Admin User"}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{user?.email || "admin@echannelling.lk"}</p>
                  <Badge className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-xs mt-1.5 w-fit px-2 py-0.5 capitalize">
                    {user?.role || "Administrator"}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem className="cursor-pointer p-3 rounded-md hover:bg-cyan-50 transition-colors duration-200">
              <User className="w-5 h-5 mr-3 text-cyan-600" />
              <span className="font-medium text-gray-700">View Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer p-3 rounded-md hover:bg-cyan-50 transition-colors duration-200">
              <Settings className="w-5 h-5 mr-3 text-cyan-600" />
              <span className="font-medium text-gray-700">Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="cursor-pointer p-3 rounded-md bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border border-red-200 transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 mr-3 text-red-600 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-bold text-red-600 text-base group-hover:text-red-700">Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Prominent Logout Button */}
        <Button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden lg:inline">Logout</span>
        </Button>
      </div>
    </header>
  )
}
