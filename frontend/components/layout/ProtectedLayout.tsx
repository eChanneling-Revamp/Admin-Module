"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import Sidebar from "./Sidebar"
import TopBar from "./TopBar"

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Wait for auth to initialize before deciding to redirect
    if (isInitialized && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isInitialized) return null

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="md:ml-64">
        <TopBar setSidebarOpen={setSidebarOpen}/>
        <main className="pt-16 p-3 md:p-6 md:mt-10 lg:mt-10">{children}</main>
      </div>
    </div>
  )
}
