import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  Truck, 
  Package, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ordersApi } from '@/services/api'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import EmptyState from '@/components/shared/EmptyState'
import { formatDate, formatCurrency } from '@/lib/utils'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const deliverySteps = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Clock },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
]

const getStepIndex = (status: string) => {
  const index = deliverySteps.findIndex(s => s.key === status)
  return index >= 0 ? index : 0
}

export default function DeliveriesPage() {
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['buyer-orders'],
    queryFn: () => ordersApi.getAll(),
  })

  const orders = ordersData?.data || []

  // Filter to only show orders that are in delivery process
  const deliveryOrders = orders.filter((order: any) => 
    ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)
  )

  // Active deliveries (not delivered yet)
  const activeDeliveries = deliveryOrders.filter((order: any) => 
    order.status !== 'delivered'
  )

  // Completed deliveries
  const completedDeliveries = deliveryOrders.filter((order: any) => 
    order.status === 'delivered'
  )

  if (isLoading) {
    return <PageLoader />
  }

  if (deliveryOrders.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deliveries</h1>
          <p className="text-muted-foreground">Track your active and completed deliveries</p>
        </div>
        <EmptyState
          icon={Truck}
          title="No deliveries yet"
          description="Your deliveries will appear here once you place an order."
          action={
            <Button asChild>
              <Link to="/buyer/shop">Start Shopping</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deliveries</h1>
        <p className="text-muted-foreground">Track your active and completed deliveries</p>
      </div>

      {/* Active Deliveries */}
      {activeDeliveries.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Active Deliveries ({activeDeliveries.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeDeliveries.map((order: any) => {
              const stepIndex = getStepIndex(order.status)
              const progress = ((stepIndex + 1) / deliverySteps.length) * 100
              
              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Order #{order.id.slice(0, 8)}
                      </CardTitle>
                      <Badge variant={
                        order.status === 'shipped' ? 'default' : 'secondary'
                      }>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Delivery Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Delivery Steps */}
                    <div className="flex justify-between">
                      {deliverySteps.map((step, index) => {
                        const isCompleted = index <= stepIndex
                        const isCurrent = index === stepIndex
                        const Icon = step.icon
                        
                        return (
                          <div 
                            key={step.key}
                            className={`flex flex-col items-center ${
                              isCompleted ? 'text-primary' : 'text-muted-foreground'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] mt-1 hidden sm:block">{step.label}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Estimated Delivery */}
                    {(order as any).estimated_delivery && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Est. delivery: {formatDate((order as any).estimated_delivery)}</span>
                      </div>
                    )}

                    {/* Tracking */}
                    {(order as any).tracking_number && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Tracking Number</p>
                        <p className="font-mono text-sm">{(order as any).tracking_number}</p>
                      </div>
                    )}

                    {/* Seller Info */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        From: <span className="font-medium text-foreground">{(order as any).farmer_name || order.farmerName}</span>
                      </span>
                      <span className="font-semibold">{formatCurrency((order as any).total_amount || order.totalAmount)}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Completed Deliveries */}
      {completedDeliveries.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Completed Deliveries ({completedDeliveries.length})
          </h2>
          <div className="space-y-3">
            {completedDeliveries.slice(0, 5).map((order: any) => (
              <Card key={order.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          Delivered on {formatDate((order as any).updated_at || order.updatedAt)} • From {(order as any).farmer_name || order.farmerName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency((order as any).total_amount || order.totalAmount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items?.length || 0} items
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-primary">Delivery Information</p>
              <p className="text-sm text-muted-foreground mt-1">
                Orders are typically processed within 24 hours. Delivery times may vary based on your location. 
                You'll receive updates at each stage of delivery.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
