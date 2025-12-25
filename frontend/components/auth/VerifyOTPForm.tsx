"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { verifyOTP, requestPasswordReset } from "@/lib/authService"
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react"
import Link from "next/link"

export function VerifyOTPForm() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { toast } = useToast()
  const router = useRouter()

  // Get identifier from sessionStorage
  const identifier = typeof window !== "undefined" ? sessionStorage.getItem("reset_identifier") : null

  // Redirect if no identifier
  useEffect(() => {
    if (!identifier) {
      router.push("/forgot-password")
    }
  }, [identifier, router])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char
    })
    setOtp(newOtp)

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5)
    inputRefs.current[lastIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const otpString = otp.join("")
    if (otpString.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter all 6 digits",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await verifyOTP(identifier!, otpString)

      if (response.success) {
        // Store reset token
        sessionStorage.setItem("reset_token", response.resetToken)

        toast({
          title: "OTP Verified",
          description: response.message,
        })

        // Redirect to reset password page
        router.push("/forgot-password/reset")
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Invalid OTP. Please try again.",
        variant: "destructive",
      })

      // Clear OTP inputs
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return

    setIsLoading(true)
    try {
      const response = await requestPasswordReset(identifier!)

      if (response.success) {
        toast({
          title: "OTP Resent",
          description: response.message,
        })

        // Reset countdown
        setCountdown(30)
        setCanResend(false)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isOtpComplete = otp.every((digit) => digit !== "")

  // Mask email/phone for display
  const maskedContact = identifier
    ? identifier.includes("@")
      ? identifier.replace(/(.{2})(.*)(@.*)/, "$1***$3")
      : identifier.replace(/(.{2})(.*)(.{2})/, "$1***$3")
    : ""

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
          <p className="text-sm text-gray-600 mt-2">Enter the 6-digit code sent to your registered email/phone</p>
          {maskedContact && <p className="text-xs text-gray-500 mt-1">Sent to: {maskedContact}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-14 text-center text-xl font-semibold border-2 rounded-lg focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 outline-none transition-all bg-white"
              disabled={isLoading}
              autoFocus={index === 0}
            />
          ))}
        </div>

        <div className="text-center text-sm">
          <span className="text-gray-600">Didn't receive the code? </span>
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="text-[#0066cc] hover:text-[#0052a3] font-medium transition-colors"
              disabled={isLoading}
            >
              Resend OTP
            </button>
          ) : (
            <span className="text-gray-500">Resend in 0:{countdown.toString().padStart(2, "0")}</span>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-[#0066cc] hover:bg-[#0052a3] text-white font-semibold h-11"
          disabled={isLoading || !isOtpComplete}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify OTP"
          )}
        </Button>

        <div className="text-center">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to previous step
          </Link>
        </div>
      </form>
    </div>
  )
}
