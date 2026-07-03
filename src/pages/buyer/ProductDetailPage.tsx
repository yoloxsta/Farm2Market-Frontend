import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Calendar, 
  Package, 
  Minus, 
  Plus, 
  ShoppingCart,
  Leaf,
  Award,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { productsApi, buyerApi } from '@/services/api'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Product } from '@/types'

const categoryLabels: Record<string, string> = {
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  grains: 'Grains',
  dairy: 'Dairy',
  meat: 'Meat',
  herbs: 'Herbs',
  nuts: 'Nuts',
  other: 'Other',
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [quantity, setQuantity] = useState(1)

  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id!),
    enabled: !!id,
  })

  const addToCartMutation = useMutation({
    mutationFn: () => buyerApi.addToCart(id!, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast({
        title: 'Added to cart',
        description: `${quantity} ${quantity > 1 ? 'units' : 'unit'} of ${product?.name} added to your cart.`,
      })
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add item to cart. Please try again.',
      })
    },
  })

  const product: Product | undefined = productData?.data

  if (isLoading) {
    return <PageLoader />
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Product not found</h2>
        <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/buyer/shop')}>Back to Shop</Button>
      </div>
    )
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    addToCartMutation.mutate()
  }

  const totalPrice = product.price * quantity

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src={product.images?.[0] || '/placeholder-product.png'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">
              {categoryLabels[product.category] || product.category}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-muted-foreground text-lg">{product.description}</p>
          </div>

          {/* Price & Rating */}
          <div className="flex items-center gap-4">
            <div>
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(product.price)}
              </span>
              <span className="text-muted-foreground ml-2">per {product.unit}</span>
            </div>
            {product.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{product.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({(product as any).total_reviews || product.totalReviews} reviews)</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Farmer Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{(product as any).farmer_name || product.farmerName}</p>
                    {((product as any).farmer_rating || product.farmerRating) > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {((product as any).farmer_rating || product.farmerRating).toFixed(1)} rating
                      </div>
                    )}
                  </div>
                </div>
                {product.certifications && product.certifications.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Certified</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-5 w-5" />
              <span>{product.stock} {product.unit} available</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              <span>{product.location || 'Location not specified'}</span>
            </div>
            {(product as any).harvest_date && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-5 w-5" />
                <span>Harvested: {formatDate((product as any).harvest_date)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-5 w-5" />
              <span>MOQ: {product.moq} {product.unit}</span>
            </div>
          </div>

          {/* Certifications */}
          {product.certifications && product.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.certifications.map((cert, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {cert}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          {/* Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-muted-foreground">{product.unit}</span>
            </div>

            <div className="flex items-center gap-4">
              <Button
                className="flex-1"
                size="lg"
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending || product.stock === 0}
              >
                {addToCartMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ShoppingCart className="h-4 w-4 mr-2" />
                )}
                Add to Cart - {formatCurrency(totalPrice)}
              </Button>
            </div>

            {product.stock === 0 && (
              <p className="text-sm text-destructive text-center">This product is currently out of stock</p>
            )}
            {product.stock > 0 && product.stock <= 10 && (
              <p className="text-sm text-orange-600 text-center">Only {product.stock} {product.unit} left!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
