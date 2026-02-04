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
          description: `Welcome back, ${response.user.name}!`,
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
    <div className="space-y-4">
      {/* Header Section */}
      <div className="text-center space-y-2 mb-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 shadow-lg mb-2">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent">Admin Portal</h1>
        <p className="text-sm text-gray-600">Sign in to access your dashboard</p>
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
          className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white font-semibold py-5 rounded-lg text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] mt-2"
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
        <div className="text-center pt-1">
          <Link 
            href="/forgot-password" 
            className="text-sm text-cyan-600 hover:text-teal-700 font-medium transition-colors inline-flex items-center gap-1 hover:gap-2 duration-200"
          >
            <span>Forgot your password?</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Security Notice */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <svg className="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p>
              Your connection is secured with SSL encryption. Never share your login credentials with anyone.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
