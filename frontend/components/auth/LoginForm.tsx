"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { InputField } from "./InputField"
import { useAuth } from "@/contexts/AuthContext"
import { login as loginService } from "@/lib/authService"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface FormErrors {
  username?: string
  password?: string
  twoFA?: string
}

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [twoFA, setTwoFA] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!username.trim()) {
      newErrors.username = "Username is required"
    }

    if (!password.trim()) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!twoFA.trim()) {
      newErrors.twoFA = "2FA code is required"
    } else if (!/^\d{6}$/.test(twoFA)) {
      newErrors.twoFA = "2FA code must be 6 digits"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check all fields and try again.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await loginService({ username, password, twoFA })

      if (response.success && response.token && response.user) {
        login(response.token, response.user)
        toast({
          title: "Login Successful",
          description: `Welcome back, ${response.user.firstName || response.user.email}!`,
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Login Failed",
          description: response.error || "Invalid credentials",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header Section */}
      <div className="text-center space-y-3 mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-500 shadow-lg shadow-cyan-500/30">
          <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">Welcome Back</h1>
        <p className="text-sm text-gray-500">Sign in to access your admin dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username Field */}
        <div>
          <InputField
            id="username"
            label="Username or Email"
            type="text"
            value={username}
            onChange={setUsername}
            placeholder="Enter your username or email"
            error={errors.username}
            required
            disabled={isLoading}
          />
        </div>

        {/* Password Field */}
        <div>
          <InputField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            error={errors.password}
            required
            disabled={isLoading}
          />
        </div>

        {/* 2FA Code Field */}
        <div>
          <InputField
            id="twoFA"
            label="Two-Factor Authentication Code"
            type="text"
            value={twoFA}
            onChange={setTwoFA}
            placeholder="Enter 6-digit 2FA code"
            error={errors.twoFA}
            required
            disabled={isLoading}
            maxLength={6}
          />
          <p className="text-xs text-gray-500 mt-1 ml-1">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 hover:from-cyan-600 hover:via-teal-600 hover:to-blue-600 text-white font-semibold py-6 rounded-xl text-base shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-4"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In to Dashboard
            </>
          )}
        </Button>

        {/* Forgot Password Link */}
        <div className="text-center pt-2">
          <Link 
            href="/forgot-password" 
            className="text-sm text-cyan-600 hover:text-teal-600 font-medium transition-all inline-flex items-center gap-1.5 hover:gap-2.5 duration-300"
          >
            <span>Forgot your password?</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Security Notice */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-100">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your connection is secured with <span className="font-semibold text-cyan-700">256-bit SSL</span> encryption. Never share your credentials.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
