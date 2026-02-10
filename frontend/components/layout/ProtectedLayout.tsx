"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isInitialized, router])

  if (!isInitialized) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <TopBar />
        <main className="pt-16 p-6">{children}</main>
      </div>
    </div>
  )
}
