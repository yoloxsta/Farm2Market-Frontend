import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Filter, Grid, List, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { productsApi, buyerApi } from '@/services/api'
import { ProductCard, CardSkeleton } from '@/components/shared'
import EmptyState from '@/components/shared/EmptyState'
import type { ProductCategory, Product } from '@/types'

const categories: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'grains', label: 'Grains' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'meat', label: 'Meat' },
  { value: 'herbs', label: 'Herbs' },
  { value: 'nuts', label: 'Nuts' },
  { value: 'other', label: 'Other' },
]

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
]

export default function ShopPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ProductCategory | 'all'>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['products', { search, category, sortBy, minPrice, maxPrice }],
    queryFn: () => productsApi.getAll({
      search,
      category: category === 'all' ? undefined : category,
      sortBy: sortBy as any,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    }),
  })

  const addToCartMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      buyerApi.addToCart(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast({
        title: 'Added to cart',
        description: 'Product has been added to your cart.',
      })
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add product to cart.',
      })
    },
  })

  const products = data?.data || []

  const handleAddToCart = (product: Product) => {
    addToCartMutation.mutate({ productId: product.id, quantity: product.moq || 1 })
  }

  const clearFilters = () => {
    setSearch('')
    setCategory('all')
    setSortBy('newest')
    setMinPrice('')
    setMaxPrice('')
  }

  const hasActiveFilters = search || category !== 'all' || minPrice || maxPrice

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as ProductCategory | 'all')}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Price Range</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <>
          <Separator />
          <Button variant="outline" className="w-full" onClick={clearFilters}>
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shop Products</h1>
        <p className="text-muted-foreground">
          Browse fresh produce from verified farmers
        </p>
      </div>

      {/* Search and filters bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products, farmers..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Narrow down your product search
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="hidden lg:block">
                <Select value={category} onValueChange={(v) => setCategory(v as ProductCategory | 'all')}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="hidden lg:block">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="hidden lg:flex items-center border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {search && (
                <Badge variant="secondary" className="gap-1">
                  Search: {search}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch('')} />
                </Badge>
              )}
              {category !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {category}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setCategory('all')} />
                </Badge>
              )}
              {minPrice && (
                <Badge variant="secondary" className="gap-1">
                  Min: ${minPrice}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setMinPrice('')} />
                </Badge>
              )}
              {maxPrice && (
                <Badge variant="secondary" className="gap-1">
                  Max: ${maxPrice}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setMaxPrice('')} />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "space-y-4"
        }>
          {products.map((product: Product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No products found"
          description="Try adjusting your search or filters to find what you're looking for."
          action={{
            label: 'Clear Filters',
            onClick: clearFilters,
          }}
        />
      )}
    </div>
  )
}
