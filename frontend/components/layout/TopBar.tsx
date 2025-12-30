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
import { 
  Bell, 
  LogOut, 
  User, 
  Settings, 
  Search, 
  Moon, 
  Sun,
  ChevronDown,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string
  title: string
  message: string
  time: string
  type: "success" | "warning" | "info"
  read: boolean
}

const notifications: Notification[] = [
  { id: "1", title: "New appointment", message: "Patient ID: PT-1001 booked", time: "2 min ago", type: "success", read: false },
  { id: "2", title: "Schedule updated", message: "Dr. Smith's schedule changed", time: "1 hour ago", type: "info", read: false },
  { id: "3", title: "Payment failed", message: "Transaction #TXN-4521 failed", time: "3 hours ago", type: "warning", read: true },
]

export function TopBar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || ""
    const last = lastName?.[0] || ""
    return (first + last).toUpperCase() || "A"
  }

  const getFullName = () => {
    if (user?.firstName || user?.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim()
    }
    return "Admin User"
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      case "warning": return <AlertCircle className="w-4 h-4 text-amber-500" />
      default: return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-emerald-100 flex items-center justify-between px-6 fixed top-0 right-0 left-72 z-40 shadow-sm">
      {/* Left Section - Search & Date */}
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-80 pl-10 pr-4 py-2 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-medium text-emerald-600 bg-emerald-50 rounded border border-emerald-200">
            ⌘K
          </kbd>
        </div>
        
        {/* Date Display */}
        <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>{currentDate}</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-10 h-10 rounded-xl hover:bg-emerald-50 text-slate-500 hover:text-emerald-600"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative w-10 h-10 rounded-xl hover:bg-emerald-50 text-slate-500 hover:text-emerald-600"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-full ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96 p-0 rounded-2xl shadow-xl border-emerald-100">
            <div className="flex items-center justify-between p-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-blue-50">
              <h3 className="font-semibold text-slate-800">Notifications</h3>
              <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                Mark all as read
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex gap-3 p-4 border-b border-slate-50 hover:bg-emerald-50/50 transition-colors cursor-pointer ${
                    !notification.read ? "bg-emerald-50/30" : ""
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{notification.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{notification.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-emerald-100">
              <button className="w-full py-2 text-sm text-center text-emerald-600 hover:text-emerald-700 font-medium hover:bg-emerald-50 rounded-lg transition-colors">
                View all notifications
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="w-px h-8 bg-emerald-200/50 mx-2" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 px-3 py-2 h-auto rounded-xl hover:bg-emerald-50 transition-all"
            >
              <Avatar className="h-9 w-9 ring-2 ring-emerald-200">
                <AvatarImage src="/admin.webp" alt={getFullName()} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-blue-600 text-white font-semibold text-sm">
                  {user ? getInitials(user.firstName, user.lastName) : "A"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-slate-800">{getFullName()}</p>
                <p className="text-xs text-emerald-600 capitalize">{user?.role || "Administrator"}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 p-2 rounded-2xl shadow-xl border-emerald-100">
            <div className="p-3 mb-2 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                  <AvatarImage src="/admin.webp" alt={getFullName()} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-blue-600 text-white font-bold">
                    {user ? getInitials(user.firstName, user.lastName) : "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{getFullName()}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email || "admin@echannelling.lk"}</p>
                  <Badge className="mt-1 bg-gradient-to-r from-emerald-500 to-blue-600 text-white text-[10px] px-2 py-0 capitalize">
                    {user?.role || "Administrator"}
                  </Badge>
                </div>
              </div>
            </div>
            <DropdownMenuItem className="cursor-pointer p-3 rounded-xl hover:bg-emerald-50 transition-colors">
              <User className="w-4 h-4 mr-3 text-emerald-600" />
              <span className="text-sm text-slate-700">View Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer p-3 rounded-xl hover:bg-emerald-50 transition-colors">
              <Settings className="w-4 h-4 mr-3 text-emerald-600" />
              <span className="text-sm text-slate-700">Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer p-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors group"
            >
              <LogOut className="w-4 h-4 mr-3 text-red-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-red-600">Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
