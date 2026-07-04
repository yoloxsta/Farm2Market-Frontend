import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks'
import { router } from '@/routes'
import { socketService } from '@/services/socket'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// Global socket listener component
function SocketListener() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const { toast } = useToast()

  useEffect(() => {
    if (!user?.id) {
      console.log('No user, skipping socket connection')
      return
    }

    console.log('SocketListener: Connecting for user:', user.id)

    // Connect socket
    socketService.connect(user.id)

    // Global handlers for real-time updates
    const handleNewOrder = (order: any) => {
      console.log('SocketListener: Received new order:', order.id)
      qc.invalidateQueries({ queryKey: ['farmer-orders'] })
      toast({
        title: 'New Order!',
        description: `Order from ${order.buyer_name}`,
      })
    }

    const handleOrderStatus = (order: any) => {
      console.log('SocketListener: Received order status:', order.id, order.status)
      qc.invalidateQueries({ queryKey: ['buyer-orders'] })
      qc.invalidateQueries({ queryKey: ['farmer-orders'] })
      qc.invalidateQueries({ queryKey: ['order'] })
      toast({
        title: 'Order Updated',
        description: `Order #${order.id?.slice(0, 8)} is now ${order.status}`,
      })
    }

    socketService.onNewOrder(handleNewOrder)
    socketService.onOrderStatus(handleOrderStatus)

    return () => {
      console.log('SocketListener: Cleaning up')
      socketService.removeListener('order:new', handleNewOrder)
      socketService.removeListener('order:status', handleOrderStatus)
    }
  }, [user?.id, qc, toast])

  return null
}

function AppContent() {
  const { checkAuth, isLoading, isAuthenticated, isInitialized } = useAuth()

  useEffect(() => {
    checkAuth()
  }, [])

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      {/* Only connect socket after auth check is complete and user is authenticated */}
      {isAuthenticated && <SocketListener />}
      <RouterProvider router={router} />
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  )
}
