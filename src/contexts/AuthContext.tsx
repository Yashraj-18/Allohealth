'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem('authToken')
    if (token) {
      // In a real app, you'd validate the token with the backend
      // For now, we'll simulate a logged-in user
      setUser({
        id: '1',
        email: 'staff@clinic.com',
        name: 'Front Desk Staff',
        role: 'staff'
      })
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Mock authentication - any email/password works!
      if (email && password) {
        // Simulate API call
        const response = await authAPI.login(email, password)
        
        if (response.statusCode === 200) {
          localStorage.setItem('authToken', response.data.access_token)
          setUser({
            id: response.data.user.id.toString(),
            email: response.data.user.email,
            name: response.data.user.name,
            role: response.data.user.role
          })
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 