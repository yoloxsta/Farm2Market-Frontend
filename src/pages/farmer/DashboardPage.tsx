import { useQuery } from '@tanstack/react-query'
import {
  Package,
  ShoppingCart,
  DollarSign,
  Wallet,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import { StatisticCard } from '@/components/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { farmerApi, ordersApi } from '@/services/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import type { Order } from '@/types'

const orderStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected: 'bg-red-100 text-red-800',
}

export default function FarmerDashboardPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['farmer-stats'],
    queryFn: () => farmerApi.getDashboardStats(),
  })

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['farmer-orders'],
    queryFn: () => ordersApi.getAll({ status: 'pending' }),
  })

  const { data: harvestData, isLoading: harvestLoading } = useQuery({
    queryKey: ['harvest-schedules'],
    queryFn: () => farmerApi.getHarvestSchedules(),
  })

  if (statsLoading || ordersLoading || harvestLoading) {
    return <PageLoader />
  }

  const stats = statsData?.data
  const recentOrders = ordersData?.data?.slice(0, 5) || []
  const upcomingHarvests = harvestData?.data?.slice(0, 4) || []

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your farm business.
        </p>
      </div>

      {/* Statistics cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatisticCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={Package}
          trend={{ value: 12, isPositive: true }}
        />
        <StatisticCard
          title="Active Orders"
          value={stats?.activeOrders || 0}
          icon={ShoppingCart}
          trend={{ value: 5, isPositive: true }}
        />
        <StatisticCard
          title="Total Sales"
          value={formatCurrency(stats?.totalSales || 0)}
          icon={DollarSign}
          trend={{ value: 18, isPositive: true }}
        />
        <StatisticCard
          title="Escrow Balance"
          value={formatCurrency(stats?.escrowBalance || 0)}
          icon={Wallet}
          description="Pending release"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm">
              View all
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
                      <p className="font-medium">{order.buyerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} items • {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                    <Badge className={orderStatusColors[order.status]}>
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No recent orders
              </p>
            )}
          </CardContent>
        </Card>

        {/* Harvest Reminders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Harvest Reminders</CardTitle>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingHarvests.length > 0 ? (
              <div className="space-y-4">
                {upcomingHarvests.map((harvest) => (
                  <div
                    key={harvest.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className="rounded-full bg-primary/10 p-2">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{harvest.cropName}</p>
                      <p className="text-sm text-muted-foreground">
                        Expected: {formatDate(harvest.expectedHarvestDate)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {harvest.fieldLocation}
                      </p>
                    </div>
                    <Badge variant="outline">{harvest.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No upcoming harvests
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Package className="h-5 w-5" />
              Add New Product
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <ShoppingCart className="h-5 w-5" />
              View Orders
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Harvest
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <TrendingUp className="h-5 w-5" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
