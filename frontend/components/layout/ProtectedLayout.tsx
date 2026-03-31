"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    const storedValue = window.localStorage.getItem("admin-sidebar-collapsed")
    if (storedValue) {
      setIsSidebarCollapsed(storedValue === "true")
    }
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const nextValue = !prev
      window.localStorage.setItem("admin-sidebar-collapsed", String(nextValue))
      return nextValue
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={toggleSidebar} />
      <div
        className={`transition-[margin] duration-300 ease-in-out ${isSidebarCollapsed ? "ml-20" : "ml-72"}`}
      >
        <TopBar isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={toggleSidebar} />
        <main className="pt-16 min-h-[calc(100vh-64px)]">{children}</main>
      </div>
    </div>
  )
}
