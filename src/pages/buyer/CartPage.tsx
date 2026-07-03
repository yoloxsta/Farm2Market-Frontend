import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ShoppingCart, 
  Trash2, 
  Minus, 
  Plus, 
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { buyerApi } from '@/services/api'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import EmptyState from '@/components/shared/EmptyState'
import { formatCurrency } from '@/lib/utils'

export default function CartPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => buyerApi.getCart(),
  })

  const removeItemMutation = useMutation({
    mutationFn: (productId: string) => buyerApi.removeFromCart(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast({
        title: 'Item removed',
        description: 'Item has been removed from your cart.',
      })
    },
  })

  const updateQuantityMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      buyerApi.updateCartItem(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update quantity',
        variant: 'destructive',
      })
    },
  })

  const clearCartMutation = useMutation({
    mutationFn: () => buyerApi.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart.',
      })
    },
  })

  const cart = cartData?.data
  const items = cart?.items || []
  const total = cart?.total || 0

  if (isLoading) {
    return <PageLoader />
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-muted-foreground">Review items before checkout</p>
        </div>
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Looks like you haven't added any products to your cart yet."
          action={
            <Button asChild>
              <Link to="/buyer/shop">Browse Products</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => clearCartMutation.mutate()}
          disabled={clearCartMutation.isPending}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }: any) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={product.images?.[0] || '/placeholder-product.png'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/buyer/products/${product.id}`}
                      className="font-semibold hover:text-primary line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{product.farmer_name}</p>
                    <p className="text-lg font-bold text-primary mt-1">
                      {formatCurrency(product.price)} <span className="text-sm text-muted-foreground font-normal">/ {product.unit}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeItemMutation.mutate(product.id)}
                      disabled={removeItemMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center border rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={quantity <= 1 || updatingItems.has(product.id)}
                        onClick={() => {
                          const newQuantity = quantity - 1;
                          setUpdatingItems(prev => new Set(prev).add(product.id));
                          updateQuantityMutation.mutate(
                            { productId: product.id, quantity: newQuantity },
                            {
                              onSettled: () => {
                                setUpdatingItems(prev => {
                                  const next = new Set(prev);
                                  next.delete(product.id);
                                  return next;
                                });
                              }
                            }
                          );
                        }}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">
                        {updatingItems.has(product.id) ? '...' : quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={quantity >= product.stock || updatingItems.has(product.id)}
                        onClick={() => {
                          const newQuantity = quantity + 1;
                          setUpdatingItems(prev => new Set(prev).add(product.id));
                          updateQuantityMutation.mutate(
                            { productId: product.id, quantity: newQuantity },
                            {
                              onSettled: () => {
                                setUpdatingItems(prev => {
                                  const next = new Set(prev);
                                  next.delete(product.id);
                                  return next;
                                });
                              }
                            }
                          );
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Item Total */}
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {quantity} {quantity > 1 ? 'units' : 'unit'} × {formatCurrency(product.price)}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(product.price * quantity)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-green-600">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => navigate('/buyer/checkout')}
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/buyer/shop">Continue Shopping</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
