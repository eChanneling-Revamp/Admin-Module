"use client"

import type React from "react"
import Image from "next/image"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Telecom branded gradient background - Cyan to Teal to Blue */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-teal-500 to-blue-600" />
      
      {/* Animated mesh gradient overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-400/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-400/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-400/20 via-transparent to-transparent" />
      </div>

      {/* Animated floating orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[15%] w-72 h-72 rounded-full bg-gradient-to-br from-cyan-400/40 to-teal-400/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-[15%] right-[10%] w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-400/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] right-[20%] w-64 h-64 rounded-full bg-gradient-to-br from-teal-400/30 to-emerald-400/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Decorative glass circles */}
      <div className="absolute top-16 right-[20%] w-20 h-20 rounded-full border border-white/30 backdrop-blur-sm bg-white/5" />
      <div className="absolute top-32 right-[15%] w-8 h-8 rounded-full border border-white/40 backdrop-blur-sm bg-white/10" />
      <div className="absolute bottom-24 left-[15%] w-16 h-16 rounded-full border border-white/30 backdrop-blur-sm bg-white/5" />
      <div className="absolute bottom-40 left-[10%] w-6 h-6 rounded-full border border-white/50 backdrop-blur-sm bg-white/10" />
      <div className="absolute top-[45%] left-[8%] w-12 h-12 rounded-full border border-white/20 backdrop-blur-sm bg-white/5" />
      <div className="absolute bottom-[30%] right-[8%] w-10 h-10 rounded-full border border-white/30 backdrop-blur-sm bg-white/5" />

      {/* Animated ring */}
      <div className="absolute top-20 left-[25%] w-32 h-32 rounded-full border-2 border-white/20 animate-ping" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-32 right-[25%] w-24 h-24 rounded-full border-2 border-white/15 animate-ping" style={{ animationDuration: '5s', animationDelay: '1s' }} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glass card container */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Logo section with frosted glass */}
          <div className="bg-white/90 backdrop-blur-sm px-8 py-6 border-b border-cyan-100">
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
          
          {/* Form container with glass effect */}
          <div className="bg-white/95 backdrop-blur-xl px-8 py-6">
            {children}
          </div>
        </div>
        
        {/* Footer text with glass effect */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-white/10 border border-white/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-white/90 text-sm font-medium">
              Secure Admin Portal
            </p>
          </div>
          <p className="text-white/60 text-xs mt-3">
            © 2025 eChannelling. Powered by SLT Mobitel
          </p>
        </div>
      </div>
    </div>
  )
}
