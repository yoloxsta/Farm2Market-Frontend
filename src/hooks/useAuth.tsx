import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '@/types'
import { authApi } from '@/services/api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (data: Partial<User> & { password: string }) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  updateUser: (user: User) => void
  checkAuth: () => Promise<void>
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await authApi.login(email, password)
          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
            })
            localStorage.setItem('token', response.data.token)
            return { success: true }
          }
          set({ isLoading: false })
          return { success: false, message: response.message }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, message: 'An error occurred during login' }
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          const response = await authApi.register(data)
          if (response.success) {
            set({ isLoading: false })
            return { success: true, message: response.message }
          }
          set({ isLoading: false })
          return { success: false, message: response.message }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, message: 'An error occurred during registration' }
        }
      },

      logout: async () => {
        await authApi.logout()
        localStorage.removeItem('token')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      updateUser: (user: User) => {
        set({ user })
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token')
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }

        set({ isLoading: true })
        try {
          const response = await authApi.getCurrentUser()
          if (response.success && response.data) {
            set({
              user: response.data,
              token,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            localStorage.removeItem('token')
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        } catch (error) {
          localStorage.removeItem('token')
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Role-based access hook
export const useHasRole = (allowedRoles: UserRole[]): boolean => {
  const user = useAuth((state) => state.user)
  if (!user) return false
  return allowedRoles.includes(user.role)
}

// Check if user is farmer
export const useIsFarmer = (): boolean => {
  return useHasRole(['farmer'])
}

// Check if user is buyer
export const useIsBuyer = (): boolean => {
  return useHasRole(['buyer'])
}
