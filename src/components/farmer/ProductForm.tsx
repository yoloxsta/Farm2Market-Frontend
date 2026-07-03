import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useCreateProduct, useUpdateProduct } from '@/hooks'
import { uploadApi } from '@/services/api'
import type { Product, ProductCategory, ProductUnit } from '@/types'

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['vegetables', 'fruits', 'grains', 'dairy', 'meat', 'herbs', 'nuts', 'other']),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  unit: z.enum(['kg', 'lb', 'ton', 'piece', 'dozen', 'crate']),
  stock: z.number().min(0, 'Stock cannot be negative'),
  moq: z.number().min(1, 'MOQ must be at least 1'),
  harvestDate: z.string(),
  location: z.string().min(2, 'Location is required'),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Product | null
  onSuccess: () => void
}

const categories: { value: ProductCategory; label: string }[] = [
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'grains', label: 'Grains' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'meat', label: 'Meat' },
  { value: 'herbs', label: 'Herbs' },
  { value: 'nuts', label: 'Nuts' },
  { value: 'other', label: 'Other' },
]

const units: { value: ProductUnit; label: string }[] = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'lb', label: 'Pound (lb)' },
  { value: 'ton', label: 'Ton' },
  { value: 'piece', label: 'Piece' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'crate', label: 'Crate' },
]

export default function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { toast } = useToast()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      category: product?.category || 'vegetables',
      price: product?.price || 0,
      unit: product?.unit || 'kg',
      stock: product?.stock || 0,
      moq: product?.moq || 1,
      harvestDate: product?.harvestDate?.split('T')[0] || '',
      location: product?.location || '',
    },
  })

  const selectedCategory = watch('category')
  const selectedUnit = watch('unit')

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: string[] = []
    const newFiles: File[] = []

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        // Create preview URL
        const previewUrl = URL.createObjectURL(file)
        newImages.push(previewUrl)
        newFiles.push(file)
      }
    })

    setImages((prev) => [...prev, ...newImages])
    setImageFiles((prev) => [...prev, ...newFiles])
  }

  // Remove image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Upload images to server first
      let uploadedImageUrls: string[] = []
      
      if (imageFiles.length > 0) {
        // Upload each image file to the server
        const uploadPromises = imageFiles.map(async (file) => {
          try {
            const response = await uploadApi.uploadImage(file)
            return response.data.url
          } catch (error) {
            console.error('Failed to upload image:', error)
            return null
          }
        })
        
        const results = await Promise.all(uploadPromises)
        uploadedImageUrls = results.filter((url): url is string => url !== null)
      }
      
      const productData = {
        ...data,
        category: selectedCategory,
        unit: selectedUnit,
        images: uploadedImageUrls.length > 0 
          ? uploadedImageUrls 
          : ['https://images.unsplash.com/photo-1546470427-227c7369a9b5?w=400&h=300&fit=crop'],
        certifications: [],
      }

      if (product) {
        await updateMutation.mutateAsync({
          id: product.id,
          data: productData,
        })
        toast({
          title: 'Product updated',
          description: 'Your product has been updated successfully.',
        })
      } else {
        await createMutation.mutateAsync(productData)
        toast({
          title: 'Product created',
          description: 'Your product has been added to your inventory.',
        })
      }
      onSuccess()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      })
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Image Upload Section */}
      <div className="space-y-2">
        <Label>Product Images</Label>
        
        {/* Image Preview Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-2">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                <img
                  src={img}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 text-xs bg-primary text-white px-1 rounded">
                    Main
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelect}
          />
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Click to upload images or drag and drop
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, WEBP up to 5MB each (max 6 images)
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            placeholder="e.g., Organic Tomatoes"
            {...register('name')}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your product..."
            rows={3}
            {...register('description')}
            disabled={isLoading}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={selectedCategory}
            onValueChange={(value) => setValue('category', value as ProductCategory)}
            disabled={isLoading}
          >
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
          <Label>Unit</Label>
          <Select
            value={selectedUnit}
            onValueChange={(value) => setValue('unit', value as ProductUnit)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.value} value={unit.value}>
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price per Unit (K)</Label>
          <Input
            id="price"
            type="number"
            step="1"
            placeholder="0"
            {...register('price', { valueAsNumber: true })}
            disabled={isLoading}
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock Quantity</Label>
          <Input
            id="stock"
            type="number"
            placeholder="0"
            {...register('stock', { valueAsNumber: true })}
            disabled={isLoading}
          />
          {errors.stock && (
            <p className="text-sm text-destructive">{errors.stock.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="moq">Minimum Order Quantity</Label>
          <Input
            id="moq"
            type="number"
            placeholder="1"
            {...register('moq', { valueAsNumber: true })}
            disabled={isLoading}
          />
          {errors.moq && (
            <p className="text-sm text-destructive">{errors.moq.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="harvestDate">Harvest Date</Label>
          <Input
            id="harvestDate"
            type="date"
            {...register('harvestDate')}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g., California, USA"
            {...register('location')}
            disabled={isLoading}
          />
          {errors.location && (
            <p className="text-sm text-destructive">{errors.location.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {product ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            product ? 'Update Product' : 'Create Product'
          )}
        </Button>
      </div>
    </form>
  )
}
