"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { requestPasswordReset } from "@/lib/authService"
import { Loader2, KeyRound, ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"

export function ForgotPasswordForm() {
  const [identifier, setIdentifier] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!identifier.trim()) {
      setError("Username or email is required")
      return
    }

    if (identifier.length < 3) {
      setError("Please enter at least 3 characters")
      return
    }

    setIsLoading(true)

    try {
      const response = await requestPasswordReset(identifier)

      if (response.success) {
        // Store identifier in sessionStorage for next step
        sessionStorage.setItem("reset_identifier", identifier)

        toast({
          title: "OTP Sent",
          description: response.message,
        })

        // Redirect to verify page
        router.push("/forgot-password/verify")
      } else {
        setError(response.message)
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-[#0066cc]" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-sm text-gray-600 mt-2">
            Enter your username or email address and we'll send you an OTP to reset your password.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
            Username or Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your username or email"
              className="pl-10 h-11"
              disabled={isLoading}
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <Button
          type="submit"
          className="w-full bg-[#0066cc] hover:bg-[#0052a3] text-white font-semibold h-11"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Sending...
            </>
          ) : (
            "Send OTP"
          )}
        </Button>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-[#0066cc] hover:text-[#0052a3] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  )
}
