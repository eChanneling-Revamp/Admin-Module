interface LoginCredentials {
  username: string
  password: string
  twoFA: string
}

interface LoginResponse {
  success: boolean
  token?: string
  refreshToken?: string
  user?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    role: 'ADMIN' | 'DOCTOR' | 'HOSPITAL' | 'PATIENT'
    isActive: boolean
    lastLoginAt?: string
    createdAt: string
    updatedAt: string
  }
  error?: string
  message?: string
}

interface PasswordResetResponse {
  success: boolean
  message: string
}

interface VerifyOTPResponse {
  success: boolean
  resetToken: string
  message: string
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    // Use external backend API - configure NEXT_PUBLIC_API_URL in environment
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    // Remove trailing slash to prevent double slashes
    const cleanUrl = backendUrl.replace(/\/$/, '')
    const response = await fetch(`${cleanUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Login failed",
      }
    }

    // Backend returns { success: true, message: string, data: { user, accessToken, refreshToken } }
    const authData = data.data
    
    return {
      success: true,
      token: authData?.accessToken,
      refreshToken: authData?.refreshToken,
      user: authData?.user,
    }
  } catch (error) {
    return {
      success: false,
      error: "Network error. Please try again.",
    }
  }
}

export async function requestPasswordReset(identifier: string): Promise<PasswordResetResponse> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    // Remove trailing slash to prevent double slashes
    const cleanUrl = backendUrl.replace(/\/$/, '')
    const response = await fetch(`${cleanUrl}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: identifier }),
    })

    const data = await response.json()

    return {
      success: data.success || false,
      message: data.message || "Failed to send reset email. Please try again.",
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to send reset email. Please try again.",
    }
  }
}

// Optional: Add refresh token function
export async function refreshToken(refreshToken: string): Promise<LoginResponse> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    // Remove trailing slash to prevent double slashes
    const cleanUrl = backendUrl.replace(/\/$/, '')
    const response = await fetch(`${cleanUrl}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Token refresh failed",
      }
    }

    // Backend returns { success: true, message: string, data: { user, accessToken, refreshToken } }
    const authData = data.data

    return {
      success: true,
      token: authData?.accessToken,
      refreshToken: authData?.refreshToken,
      user: authData?.user,
    }
  } catch (error) {
    return {
      success: false,
      error: "Network error. Please try again.",
    }
  }
}

export async function verifyOTP(identifier: string, otp: string): Promise<VerifyOTPResponse> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    // Remove trailing slash to prevent double slashes
    const cleanUrl = backendUrl.replace(/\/$/, '')
    const response = await fetch(`${cleanUrl}/api/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, otp }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Invalid OTP")
    }

    return {
      success: data.success,
      resetToken: data.data?.resetToken,
      message: data.message,
    }
  } catch (error: any) {
    throw new Error(error.message || "Invalid OTP. Please try again.")
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<PasswordResetResponse> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    // Remove trailing slash to prevent double slashes
    const cleanUrl = backendUrl.replace(/\/$/, '')
    const response = await fetch(`${cleanUrl}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password: newPassword }),
    })

    const data = await response.json()

    return {
      success: data.success || false,
      message: data.message || "Failed to reset password. Please try again.",
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to reset password. Please try again.",
    }
  }
}
