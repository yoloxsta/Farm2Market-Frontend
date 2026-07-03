import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  CreditCard, 
  MapPin, 
  FileText, 
  CheckCircle,
  Loader2,
  ArrowLeft,
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/components/ui/use-toast'
import { buyerApi, ordersApi } from '@/services/api'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import EmptyState from '@/components/shared/EmptyState'
import { formatCurrency } from '@/lib/utils'

const checkoutSchema = z.object({
  shippingAddress: z.string().min(10, 'Please enter a valid address'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  phone: z.string().min(8, 'Phone number is required'),
  notes: z.string().optional(),
  paymentMethod: z.enum(['escrow', 'cod']),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isProcessing, setIsProcessing] = useState(false)

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => buyerApi.getCart(),
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: '',
      city: '',
      postalCode: '',
      phone: '',
      notes: '',
      paymentMethod: 'escrow',
    },
  })

  const cart = cartData?.data
  const items = cart?.items || []
  const subtotal = cart?.total || 0
  const paymentMethod = watch('paymentMethod')

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Cart is empty',
        description: 'Please add items to your cart before checkout.',
      })
      return
    }

    setIsProcessing(true)

    try {
      const orderData: any = {
        items: items.map(({ product, quantity }: any) => ({
          productId: product.id,
          quantity,
        })),
        shippingAddress: {
          address: data.shippingAddress,
          city: data.city,
          postalCode: data.postalCode,
          phone: data.phone,
        },
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      }

      await ordersApi.create(orderData)
      
      // Clear cart after successful order
      await buyerApi.clearCart()
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] })
      
      toast({
        title: 'Order placed successfully!',
        description: 'You will receive a confirmation shortly.',
      })
      
      navigate('/buyer/orders')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Order failed',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground">Complete your order</p>
        </div>
        <EmptyState
          icon={Package}
          title="No items to checkout"
          description="Your cart is empty. Add some products first."
          action={
            <Button asChild>
              <span onClick={() => navigate('/buyer/shop')}>Browse Products</span>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground">Complete your order</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingAddress">Street Address *</Label>
                  <Input
                    id="shippingAddress"
                    placeholder="123 Main Street"
                    {...register('shippingAddress')}
                    disabled={isProcessing}
                  />
                  {errors.shippingAddress && (
                    <p className="text-sm text-destructive">{errors.shippingAddress.message}</p>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      {...register('city')}
                      disabled={isProcessing}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      placeholder="10001"
                      {...register('postalCode')}
                      disabled={isProcessing}
                    />
                    {errors.postalCode && (
                      <p className="text-sm text-destructive">{errors.postalCode.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="+1 234 567 8900"
                    {...register('phone')}
                    disabled={isProcessing}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={paymentMethod}
                  onValueChange={(value) => setValue('paymentMethod', value as 'escrow' | 'cod')}
                  className="grid gap-4"
                >
                  <Label
                    htmlFor="escrow"
                    className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer ${
                      paymentMethod === 'escrow' ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="escrow" id="escrow" />
                      <div>
                        <p className="font-medium">Escrow Payment</p>
                        <p className="text-sm text-muted-foreground">Secure payment held until delivery</p>
                      </div>
                    </div>
                    <CheckCircle className={`h-5 w-5 ${paymentMethod === 'escrow' ? 'text-primary' : 'text-muted'}`} />
                  </Label>
                  <Label
                    htmlFor="cod"
                    className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer ${
                      paymentMethod === 'cod' ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="cod" id="cod" />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                      </div>
                    </div>
                    <CheckCircle className={`h-5 w-5 ${paymentMethod === 'cod' ? 'text-primary' : 'text-muted'}`} />
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Order Notes (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any special instructions for your order..."
                  {...register('notes')}
                  disabled={isProcessing}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items List */}
                <div className="space-y-3">
                  {items.map(({ product, quantity }: any) => (
                    <div key={product.id} className="flex gap-3">
                      <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={product.images?.[0] || '/placeholder-product.png'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {quantity} × {formatCurrency(product.price)}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {formatCurrency(product.price * quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(subtotal)}</span>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  By placing this order, you agree to our terms and conditions
                </p>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
