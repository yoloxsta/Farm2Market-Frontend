// User & Auth Types
export type UserRole = 'farmer' | 'buyer' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface FarmerProfile extends User {
  role: 'farmer'
  farmName: string
  farmLocation: string
  farmSize: number // in acres
  farmDescription?: string
  certifications: string[]
  rating: number
  totalSales: number
  harvestSchedules: HarvestSchedule[]
}

export interface BuyerProfile extends User {
  role: 'buyer'
  companyName: string
  businessType: string
  shippingAddress: Address
  billingAddress?: Address
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

// Product Types
export interface Product {
  id: string
  farmerId: string
  farmerName: string
  farmerRating: number
  name: string
  description: string
  category: ProductCategory
  subcategory?: string
  images: string[]
  price: number
  unit: ProductUnit
  stock: number
  moq: number // Minimum Order Quantity
  harvestDate: string
  expiryDate?: string
  location: string
  certifications: string[]
  rating: number
  totalReviews: number
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export type ProductCategory = 
  | 'vegetables'
  | 'fruits'
  | 'grains'
  | 'dairy'
  | 'meat'
  | 'herbs'
  | 'nuts'
  | 'other'

export type ProductUnit = 'kg' | 'lb' | 'ton' | 'piece' | 'dozen' | 'crate'

export type ProductStatus = 'available' | 'low_stock' | 'out_of_stock' | 'discontinued'

// Order Types
export interface Order {
  id: string
  buyerId: string
  buyerName: string
  farmerId: string
  farmerName: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  shippingAddress: Address
  notes?: string
  escrowBalance?: number
  trackingNumber?: string
  estimatedDelivery?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage: string
  quantity: number
  unit: ProductUnit
  pricePerUnit: number
  total: number
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'rejected'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'escrow'

// Harvest Schedule Types
export interface HarvestSchedule {
  id: string
  farmerId: string
  cropName: string
  fieldLocation: string
  plantingDate: string
  expectedHarvestDate: string
  estimatedYield: number
  unit: ProductUnit
  status: 'planned' | 'planted' | 'growing' | 'ready' | 'harvested'
  notes?: string
}

// Analytics Types
export interface SalesAnalytics {
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  topProducts: ProductSales[]
  monthlySales: MonthlySales[]
}

export interface ProductSales {
  productId: string
  productName: string
  totalSold: number
  revenue: number
}

export interface MonthlySales {
  month: string
  sales: number
  orders: number
}

// Earnings Types
export interface Earnings {
  totalEarnings: number
  availableBalance: number
  escrowBalance: number
  pendingWithdrawals: number
  withdrawalHistory: Withdrawal[]
}

export interface Withdrawal {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  bankAccount: string
  createdAt: string
  processedAt?: string
}

// Cart Types
export interface CartItem {
  product: Product
  quantity: number
}

export interface Cart {
  items: CartItem[]
  total: number
}

// Review Types
export interface Review {
  id: string
  productId: string
  buyerId: string
  buyerName: string
  rating: number
  comment: string
  createdAt: string
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'order' | 'payment' | 'delivery' | 'system'
  read: boolean
  createdAt: string
}

// Dashboard Stats Types
export interface FarmerDashboardStats {
  totalProducts: number
  activeOrders: number
  totalSales: number
  escrowBalance: number
  recentOrders: Order[]
  upcomingHarvests: HarvestSchedule[]
}

export interface BuyerDashboardStats {
  totalOrders: number
  pendingDeliveries: number
  totalSpent: number
  recentOrders: Order[]
  recommendedProducts: Product[]
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

// Filter Types
export interface ProductFilters {
  search?: string
  category?: ProductCategory
  minPrice?: number
  maxPrice?: number
  location?: string
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest'
}

export interface OrderFilters {
  status?: OrderStatus
  startDate?: string
  endDate?: string
  search?: string
}
