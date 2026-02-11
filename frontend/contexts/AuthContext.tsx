"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
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

interface AuthContextType {
  user: User | null
  token: string | null
  refreshToken: string | null
  isInitialized: boolean
  login: (token: string, user: User, refreshToken?: string | null) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const parseJwtExpiry = (jwtToken: string): number | null => {
    try {
      const payload = jwtToken.split(".")[1]
      if (!payload) {
        return null
      }
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
      const decoded = JSON.parse(atob(normalized))
      return typeof decoded.exp === "number" ? decoded.exp * 1000 : null
    } catch (error) {
      return null
    }
  }

  // Load auth state from localStorage on mount
  useEffect(() => {
    let isActive = true

    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("auth_token")
      const storedUser = localStorage.getItem("auth_user")
      const storedRefreshToken = localStorage.getItem("auth_refresh_token")

      const hydrateFromStorage = () => {
        if (!storedToken || !storedUser) {
          return
        }
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        setRefreshToken(storedRefreshToken)
      }

      const maybeRefresh = async () => {
        if (!storedToken || !storedUser) {
          return
        }
        const expiry = parseJwtExpiry(storedToken)
        const isExpired = typeof expiry === "number" && expiry <= Date.now()
        if (!isExpired) {
          hydrateFromStorage()
          return
        }

        if (!storedRefreshToken) {
          return
        }

        try {
          const { refreshToken: refreshTokenRequest } = await import("@/lib/authService")
          const response = await refreshTokenRequest(storedRefreshToken)
          if (!isActive) {
            return
          }
          if (response.success && response.token && response.user) {
            setToken(response.token)
            setUser(response.user)
            setRefreshToken(response.refreshToken || storedRefreshToken)
            localStorage.setItem("auth_token", response.token)
            localStorage.setItem("auth_user", JSON.stringify(response.user))
            if (response.refreshToken) {
              localStorage.setItem("auth_refresh_token", response.refreshToken)
            }
          }
        } catch (error) {
          // Ignore refresh errors and fall back to unauthenticated state.
        }
      }

      Promise.resolve(maybeRefresh()).finally(() => {
        if (isActive) {
          setIsInitialized(true)
        }
      })
    }

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (!token || !refreshToken) {
      return
    }

    const expiry = parseJwtExpiry(token)
    if (!expiry) {
      return
    }

    const refreshDelayMs = Math.max(expiry - Date.now() - 60_000, 0)
    const timeoutId = window.setTimeout(async () => {
      try {
        const { refreshToken: refreshTokenRequest } = await import("@/lib/authService")
        const response = await refreshTokenRequest(refreshToken)
        if (response.success && response.token && response.user) {
          setToken(response.token)
          setUser(response.user)
          setRefreshToken(response.refreshToken || refreshToken)
          localStorage.setItem("auth_token", response.token)
          localStorage.setItem("auth_user", JSON.stringify(response.user))
          if (response.refreshToken) {
            localStorage.setItem("auth_refresh_token", response.refreshToken)
          }
        }
      } catch (error) {
        // Ignore refresh errors and rely on existing session state.
      }
    }, refreshDelayMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [token, refreshToken])

  const login = (newToken: string, newUser: User, newRefreshToken?: string | null) => {
    setToken(newToken)
    setUser(newUser)
    setRefreshToken(newRefreshToken ?? null)
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", newToken)
      localStorage.setItem("auth_user", JSON.stringify(newUser))
      if (newRefreshToken) {
        localStorage.setItem("auth_refresh_token", newRefreshToken)
      } else {
        localStorage.removeItem("auth_refresh_token")
      }
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setRefreshToken(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("auth_user")
      localStorage.removeItem("auth_refresh_token")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isInitialized,
        login,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
