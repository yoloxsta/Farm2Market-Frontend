import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to admin-login for admin routes, regular login for others
    const loginPath = allowedRoles?.includes('admin') ? '/admin-login' : '/login'
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = user.role === 'admin' ? '/admin' : user.role === 'farmer' ? '/farmer' : '/buyer'
    return <Navigate to={redirectPath} replace />
  }

  return <>{children}</>
}
