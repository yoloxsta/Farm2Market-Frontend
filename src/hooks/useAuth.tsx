import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '@/types'
import { authApi } from '@/services/api'
import { socketService } from '@/services/socket'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  updateUser: (user: User) => void
  checkAuth: () => Promise<void>
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

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
              isInitialized: true,
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

      // Self-registration is disabled - only admin can create users via createUser
      // register: async (data) => {
      //   set({ isLoading: true })
      //   try {
      //     const response = await authApi.register(data)
      //     if (response.success) {
      //       set({ isLoading: false })
      //       return { success: true, message: response.message }
      //     }
      //     set({ isLoading: false })
      //     return { success: false, message: response.message }
      //   } catch (error) {
      //     set({ isLoading: false })
      //     return { success: false, message: 'An error occurred during registration' }
      //   }
      // },

      logout: async () => {
        // Clear everything immediately for fast UI response
        localStorage.removeItem('token')
        localStorage.removeItem('auth-storage')
        socketService.disconnect()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isInitialized: false,
        })
        // Call API in background (don't wait for it)
        try {
          await authApi.logout()
        } catch (error) {
          // Ignore errors - user is already logged out locally
        }
      },

      updateUser: (user: User) => {
        set({ user })
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token')
        if (!token) {
          set({ isAuthenticated: false, user: null, isInitialized: true })
          return
        }

        set({ isLoading: true })
        try {
          const response = await authApi.getCurrentUser()
          if (response.success && response.data) {
            // Disconnect any existing socket with wrong user
            const currentUser = get().user
            if (currentUser && currentUser.id !== response.data.id) {
              socketService.disconnect()
            }
            set({
              user: response.data,
              token,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
            })
          } else {
            localStorage.removeItem('token')
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              isInitialized: true,
            })
          }
        } catch (error) {
          localStorage.removeItem('token')
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
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
