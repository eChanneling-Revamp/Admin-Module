"use client"

import type React from "react"
import Image from "next/image"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* eChannelling branded gradient background - Blue to Teal mix */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-cyan-600 to-teal-500" />
      
      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 right-32 w-64 h-64 rounded-full bg-white/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-white/15 blur-3xl animate-pulse delay-1000" />
        </div>
      </div>

      {/* Decorative circles */}
      <div className="absolute top-20 right-32 w-24 h-24 rounded-full border-4 border-white/20 animate-ping" style={{ animationDuration: '3s' }} />
      <div className="absolute top-12 right-20 w-16 h-16 rounded-full border-4 border-white/30" />
      <div className="absolute top-1/3 left-32 w-32 h-32 rounded-full border-4 border-white/20" />
      <div className="absolute bottom-32 right-16 w-20 h-20 rounded-full border-4 border-white/25 animate-ping" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-20 right-48 w-12 h-12 rounded-full border-4 border-white/40" />

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo container at the top */}
        <div className="bg-white/95 backdrop-blur-sm rounded-t-2xl shadow-2xl py-4 px-6 border-b-2 border-gradient-to-r from-cyan-600 to-teal-600">
          <div className="flex items-center justify-center">
            <Image 
              src="/echannelling.png" 
              alt="eChannelling Logo" 
              width={180} 
              height={50}
              className="object-contain"
              priority
            />
          </div>
        </div>
        
        {/* Form container */}
        <div className="bg-white/95 backdrop-blur-sm rounded-b-2xl shadow-2xl px-6 py-5">
          {children}
        </div>
        
        {/* Footer text */}
        <div className="mt-4 text-center">
          <p className="text-white/90 text-sm font-medium">
            Secure Admin Portal
          </p>
          <p className="text-white/70 text-xs mt-1">
            © 2025 eChannelling. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
