import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Package, DollarSign, ShoppingBag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { farmerApi } from '@/services/api'
import { formatCurrency } from '@/lib/utils'
import { PageLoader } from '@/components/shared/LoadingSpinner'

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['farmer-analytics'],
    queryFn: () => farmerApi.getAnalytics(),
  })

  if (isLoading) {
    return <PageLoader />
  }

  const analytics = data?.data
  const monthlySales = analytics?.monthlySales || []
  const topProducts = analytics?.topProducts || []

  // Calculate totals
  const totalSales = monthlySales.reduce((sum: number, m: any) => sum + m.sales, 0)
  const totalOrders = monthlySales.reduce((sum: number, m: any) => sum + m.orders, 0)
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Your farm's performance overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(totalSales)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShoppingBag className="h-4 w-4" />
              <span className="text-sm">Total Orders</span>
            </div>
            <p className="text-2xl font-bold mt-2">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Average Order Value</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(averageOrderValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span className="text-sm">Units Sold</span>
            </div>
            <p className="text-2xl font-bold mt-2">{topProducts.reduce((sum: number, p: any) => sum + p.sales, 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product: any, index: number) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <p className="font-semibold">{formatCurrency(product.sales)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No sales data yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlySales.length > 0 ? (
            <div className="space-y-3">
              {monthlySales.map((month: any) => (
                <div
                  key={month.month}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <span className="font-medium">{month.month}</span>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(month.sales)}</p>
                    <p className="text-sm text-muted-foreground">{month.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No monthly data yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
