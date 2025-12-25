"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { resetPassword } from "@/lib/authService"
import { validatePassword, getPasswordStrength, isPasswordValid } from "@/lib/validation/passwordRules"
import { Loader2, Lock, Eye, EyeOff, Check, X } from "lucide-react"
import Link from "next/link"

export function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmError, setConfirmError] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const resetToken = typeof window !== "undefined" ? sessionStorage.getItem("reset_token") : null

  // Redirect if no reset token
  useEffect(() => {
    if (!resetToken) {
      router.push("/forgot-password")
    }
  }, [resetToken, router])

  const validation = validatePassword(newPassword)
  const strength = getPasswordStrength(validation)
  const isValid = isPasswordValid(validation)

  const strengthColors = {
    weak: "bg-red-500",
    medium: "bg-yellow-500",
    strong: "bg-green-500",
  }

  const strengthWidth = {
    weak: "w-1/3",
    medium: "w-2/3",
    strong: "w-full",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setConfirmError("")

    if (!isValid) {
      toast({
        title: "Invalid Password",
        description: "Please meet all password requirements",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      setConfirmError("Passwords do not match")
      toast({
        title: "Password Mismatch",
        description: "Please ensure both passwords match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await resetPassword(resetToken!, newPassword)

      if (response.success) {
        toast({
          title: "Password Reset Successful",
          description: response.message,
        })

        // Clear session storage
        sessionStorage.removeItem("reset_identifier")
        sessionStorage.removeItem("reset_token")

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        toast({
          title: "Reset Failed",
          description: response.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
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
            <Lock className="w-8 h-8 text-[#0066cc]" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Password</h1>
          <p className="text-sm text-gray-600 mt-2">
            Your new password must be different from previously used passwords
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="pr-10 h-11"
              disabled={isLoading}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {newPassword && (
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Password strength:</span>
                <span
                  className={`font-medium ${
                    strength === "weak" ? "text-red-600" : strength === "medium" ? "text-yellow-600" : "text-green-600"
                  }`}
                >
                  {strength.charAt(0).toUpperCase() + strength.slice(1)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${strengthColors[strength]} ${strengthWidth[strength]} transition-all`} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            Confirm New Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setConfirmError("")
              }}
              placeholder="Re-enter new password"
              className="pr-10 h-11"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {confirmError && <p className="text-xs text-red-600">{confirmError}</p>}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
          <div className="space-y-1.5">
            <RequirementItem met={validation.minLength} text="At least 8 characters" />
            <RequirementItem met={validation.hasUppercase} text="One uppercase letter (A-Z)" />
            <RequirementItem met={validation.hasLowercase} text="One lowercase letter (a-z)" />
            <RequirementItem met={validation.hasNumber} text="One number (0-9)" />
            <RequirementItem met={validation.hasSpecial} text="One special character (!@#$%^&*)" />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#0066cc] hover:bg-[#0052a3] text-white font-semibold h-11"
          disabled={isLoading || !isValid || newPassword !== confirmPassword}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>

        <div className="text-center">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  )
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
      ) : (
        <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
      )}
      <span className={met ? "text-green-600" : "text-gray-600"}>{text}</span>
    </div>
  )
}
