import { useQuery } from '@tanstack/react-query'
import { Package, Truck, DollarSign, ShoppingBag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { buyerApi, ordersApi, productsApi } from '@/services/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { Link } from 'react-router-dom'

export default function BuyerDashboardPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['buyer-stats'],
    queryFn: () => buyerApi.getDashboardStats(),
  })

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['buyer-orders'],
    queryFn: () => ordersApi.getAll(),
  })

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['recommended-products'],
    queryFn: () => productsApi.getAll({ sortBy: 'rating' }),
  })

  if (statsLoading || ordersLoading || productsLoading) {
    return <PageLoader />
  }

  const stats = statsData?.data
  const recentOrders = ordersData?.data?.slice(0, 5) || []
  const recommendedProducts = productsData?.data?.slice(0, 4) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShoppingBag className="h-4 w-4" />
              <span className="text-sm">Total Orders</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats?.totalOrders || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Truck className="h-4 w-4" />
              <span className="text-sm">Pending Deliveries</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats?.pendingDeliveries || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Total Spent</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(stats?.totalSpent || 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button asChild variant="outline" className="justify-start">
              <Link to="/buyer/shop">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse Products
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/buyer/orders">
                <Package className="h-4 w-4 mr-2" />
                View Orders
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/buyer/deliveries">
                <Truck className="h-4 w-4 mr-2" />
                Track Deliveries
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/buyer/orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{order.farmer_name || order.farmerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items?.length || 0} items • {formatCurrency(order.total_amount || order.totalAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.created_at || order.createdAt)}
                    </p>
                  </div>
                  <Badge>{order.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders yet</p>
              <Button asChild className="mt-4">
                <Link to="/buyer/shop">Start Shopping</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Products */}
      {recommendedProducts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recommended for You</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/buyer/shop">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedProducts.map((product: any) => (
                <Link
                  key={product.id}
                  to={`/buyer/products/${product.id}`}
                  className="rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <img
                    src={product.images?.[0] || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="aspect-square object-cover"
                  />
                  <div className="p-3">
                    <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                    <p className="text-primary font-semibold">
                      {formatCurrency(product.price)}/{product.unit}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
