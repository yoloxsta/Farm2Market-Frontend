import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Package, Truck, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatisticCard } from '@/components/shared'
import { buyerApi, ordersApi, productsApi } from '@/services/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import type { Order, Product } from '@/types'

const orderStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

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
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your orders.
        </p>
      </div>

      {/* Statistics cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatisticCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingBag}
          trend={{ value: 10, isPositive: true }}
        />
        <StatisticCard
          title="Pending Deliveries"
          value={stats?.pendingDeliveries || 0}
          icon={Truck}
        />
        <StatisticCard
          title="Total Spent"
          value={formatCurrency(stats?.totalSpent || 0)}
          icon={DollarSign}
          trend={{ value: 8, isPositive: false }}
        />
        <StatisticCard
          title="Savings"
          value={formatCurrency((stats?.totalSpent || 0) * 0.12)}
          icon={TrendingUp}
          description="12% saved vs retail"
        />
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link to="/buyer/shop">
                <ShoppingBag className="h-5 w-5" />
                Browse Products
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link to="/buyer/orders">
                <Package className="h-5 w-5" />
                View Orders
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link to="/buyer/deliveries">
                <Truck className="h-5 w-5" />
                Track Deliveries
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link to="/buyer/shop?category=vegetables">
                <TrendingUp className="h-5 w-5" />
                Best Deals
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/buyer/orders">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order: Order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{order.farmerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} items • {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <Badge className={orderStatusColors[order.status]}>
                      {order.status}
                    </Badge>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recommended for You</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/buyer/shop">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {recommendedProducts.map((product: Product) => (
                <Link
                  key={product.id}
                  to={`/buyer/product/${product.id}`}
                  className="rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <img
                    src={product.images[0]}
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
      </div>
    </div>
  )
}
