import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X, Loader2, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { adminApi } from '@/services/api'
import { socketService } from '@/services/socket'

export default function ProductApprovalTab() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Listen for real-time updates
  useEffect(() => {
    socketService.onNewProductCreated((product) => {
      toast({ title: 'New Product Pending', description: `${product.name} by ${product.farmer_name} is pending approval.` })
      queryClient.invalidateQueries({ queryKey: ['pending-products'] })
    })

    socketService.onProductApproved((product) => {
      toast({ title: 'Product Approved', description: `${product.name} has been approved.` })
      queryClient.invalidateQueries({ queryKey: ['pending-products'] })
    })

    socketService.onProductRejected((product) => {
      toast({ title: 'Product Rejected', description: `${product.name} has been rejected.` })
      queryClient.invalidateQueries({ queryKey: ['pending-products'] })
    })

    return () => {
      socketService.removeEventListeners('admin:product:created')
      socketService.removeEventListeners('admin:product:approved')
      socketService.removeEventListeners('admin:product:rejected')
    }
  }, [])

  const { data: pendingProducts, isLoading } = useQuery({
    queryKey: ['pending-products'],
    queryFn: () => adminApi.getPendingProducts(),
  })

  const approveMutation = useMutation({
    mutationFn: (productId: string) => adminApi.approveProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-products'] })
      toast({ title: 'Product approved', description: 'Product is now visible to buyers.' })
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (productId: string) => adminApi.rejectProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-products'] })
      toast({ title: 'Product rejected', description: 'Product has been rejected.' })
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message })
    },
  })

  const products = pendingProducts?.data || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-100">
              <Package className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Products */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No pending products</p>
          ) : (
            <div className="divide-y">
              {products.map((product: any) => (
                <div key={product.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.farmer_name}</p>
                      <p className="text-sm font-medium">${product.price}/{product.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{product.category}</Badge>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => approveMutation.mutate(product.id)}
                      disabled={approveMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(product.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
