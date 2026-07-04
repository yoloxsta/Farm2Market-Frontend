import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  Package, 
  Search, 
  Filter,
  Eye,
  XCircle,
  Clock,
  Truck,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ordersApi } from '@/services/api'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import EmptyState from '@/components/shared/EmptyState'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Order } from '@/types'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  processing: 'bg-purple-100 text-purple-800 border-purple-200',
  shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
}

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  rejected: XCircle,
}

export default function BuyerOrdersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['buyer-orders'],
    queryFn: () => ordersApi.getAll(),
  })

  const orders = ordersData?.data || []

  // Filter orders
  const filteredOrders = orders.filter((order: Order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      (order as any).farmer_name?.toLowerCase().includes(search.toLowerCase()) ||
      order.farmerName?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return <PageLoader />
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="You haven't placed any orders yet. Start shopping to see your orders here."
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No orders found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order: Order) => {
            const StatusIcon = statusIcons[order.status] || Clock
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Order #</span>
                        <span className="font-mono font-medium ml-1">{order.id.slice(0, 8)}</span>
                      </div>
                      <Badge className={statusColors[order.status]}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">{formatDate((order as any).created_at || order.createdAt)}</span>
                      <span className="font-semibold">{formatCurrency((order as any).total_amount || order.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-4">
                    <div className="flex flex-wrap gap-4">
                      {order.items?.slice(0, 3).map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded overflow-hidden bg-muted">
                            <img
                              src={item.productImage || '/placeholder-product.png'}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium line-clamp-1">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} × {formatCurrency(item.pricePerUnit)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="flex items-center">
                          <Badge variant="outline">+{order.items.length - 3} more</Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Seller: <span className="font-medium text-foreground">{(order as any).farmer_name || order.farmerName}</span>
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <Badge className={statusColors[selectedOrder.status]}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDate((selectedOrder as any).created_at || selectedOrder.createdAt)}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <h4 className="font-semibold">Items</h4>
                {selectedOrder.items?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                        <img
                          src={item.productImage || '/placeholder-product.png'}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} {item.unit} × {formatCurrency(item.pricePerUnit)}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Seller & Shipping */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Seller</h4>
                  <p className="text-sm">{(selectedOrder as any).farmer_name || selectedOrder.farmerName}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Shipping Address</h4>
                  <p className="text-sm text-muted-foreground">
                    {(selectedOrder as any).shipping_address?.address || selectedOrder.shippingAddress?.street}<br />
                    {(selectedOrder as any).shipping_address?.city || selectedOrder.shippingAddress?.city}, {(selectedOrder as any).shipping_address?.postalCode || selectedOrder.shippingAddress?.zipCode}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Payment */}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="capitalize">{(selectedOrder as any).payment_method || selectedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <Badge variant="outline">{(selectedOrder as any).payment_status || selectedOrder.paymentStatus}</Badge>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency((selectedOrder as any).total_amount || selectedOrder.totalAmount)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
