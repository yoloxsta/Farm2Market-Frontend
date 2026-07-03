import { useQuery } from '@tanstack/react-query'
import { Package, ShoppingCart, DollarSign, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { farmerApi, ordersApi } from '@/services/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { Link } from 'react-router-dom'

export default function FarmerDashboardPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['farmer-stats'],
    queryFn: () => farmerApi.getDashboardStats(),
  })

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['farmer-orders'],
    queryFn: () => ordersApi.getAll({ status: 'pending' }),
  })

  if (statsLoading || ordersLoading) {
    return <PageLoader />
  }

  const stats = statsData?.data
  const recentOrders = ordersData?.data?.slice(0, 5) || []

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
              <Package className="h-4 w-4" />
              <span className="text-sm">Products</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats?.totalProducts || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm">Active Orders</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats?.activeOrders || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Total Sales</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(stats?.totalSales || 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/farmer/orders">View all</Link>
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
                    <p className="font-medium">{order.buyer_name || order.buyerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items?.length || 0} items • {formatCurrency(order.total_amount || order.totalAmount)}
                    </p>
                  </div>
                  <Badge>{order.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent orders</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline" className="justify-start">
              <Link to="/farmer/products/new">
                <Plus className="h-4 w-4 mr-2" />
                Add New Product
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/farmer/orders">
                <ShoppingCart className="h-4 w-4 mr-2" />
                View Orders
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
