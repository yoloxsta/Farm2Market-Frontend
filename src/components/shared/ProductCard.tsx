import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin, ShoppingCart } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  className?: string
  showActions?: boolean
  onAddToCart?: (product: Product) => void
}

export default function ProductCard({
  product,
  className,
  showActions = true,
  onAddToCart,
}: ProductCardProps) {
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    low_stock: 'bg-yellow-100 text-yellow-800',
    out_of_stock: 'bg-red-100 text-red-800',
    discontinued: 'bg-gray-100 text-gray-800',
  }

  // Handle both camelCase and snake_case from API
  const farmerName = (product as any).farmer_name || product.farmerName || 'Unknown Farmer'
  const farmerRating = (product as any).farmer_rating || product.farmerRating || 0
  const totalReviews = (product as any).total_reviews || product.totalReviews || 0
  // Harvest date check (unused but keeping for reference)
  // const harvestDate = (product as any).harvest_date || product.harvestDate

  return (
    <Card className={cn('overflow-hidden group', className)}>
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.images?.[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.status !== 'available' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge className={statusColors[product.status]}>
              {product.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-white/90">
            {product.category}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Farmer info */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <span>{farmerName}</span>
          {farmerRating > 0 && (
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {farmerRating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Product name */}
        <Link to={`/buyer/products/${product.id}`}>
          <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <MapPin className="h-3 w-3" />
          {product.location || 'Location not specified'}
        </div>

        {/* Price and stock */}
        <div className="flex items-end justify-between mt-3">
          <div>
            <div className="text-xl font-bold text-primary">
              {formatCurrency(product.price)}
              <span className="text-sm font-normal text-muted-foreground">/{product.unit}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              MOQ: {product.moq} {product.unit}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">{product.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-xs text-muted-foreground">
                ({totalReviews})
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full"
            onClick={() => onAddToCart?.(product)}
            disabled={product.status !== 'available'}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
