import axios from 'axios'
import type { 
  User, 
  Product, 
  Order, 
  FarmerProfile,
  HarvestSchedule,
  PaginatedResponse,
  ProductFilters,
  OrderFilters,
  ApiResponse
} from '@/types'
import { 
  mockFarmers, 
  mockBuyers, 
  mockProducts, 
  mockOrders, 
  mockHarvestSchedules,
  mockFarmerStats,
  mockBuyerStats,
  mockMonthlySales,
  mockTopProducts,
  mockWithdrawals,
  mockNotifications
} from './mockData'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Simulate API delay
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// ==========================================
// AUTH API - MOCK IMPLEMENTATION
// ==========================================
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    await simulateDelay()
    
    // Mock authentication
    const farmer = mockFarmers.find(f => f.email === email)
    const buyer = mockBuyers.find(b => b.email === email)
    
    if (farmer && password === 'password123') {
      return {
        success: true,
        data: {
          user: farmer,
          token: 'mock-jwt-token-' + farmer.id,
        },
      }
    }
    
    if (buyer && password === 'password123') {
      return {
        success: true,
        data: {
          user: buyer,
          token: 'mock-jwt-token-' + buyer.id,
        },
      }
    }
    
    return {
      success: false,
      message: 'Invalid credentials',
      data: { user: null as unknown as User, token: '' },
    }
  },
  
  register: async (data: Partial<User> & { password: string }): Promise<ApiResponse<User>> => {
    await simulateDelay()
    
    const newUser: User = {
      id: 'user-' + Date.now(),
      email: data.email!,
      name: data.name!,
      role: data.role!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    return {
      success: true,
      data: newUser,
      message: 'Registration successful',
    }
  },
  
  logout: async (): Promise<ApiResponse<null>> => {
    await simulateDelay(200)
    return { success: true, data: null }
  },
  
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    await simulateDelay()
    const farmer = mockFarmers[0]
    return {
      success: true,
      data: farmer,
    }
  },
}

// ==========================================
// PRODUCTS API - MOCK IMPLEMENTATION
// ==========================================
export const productsApi = {
  getAll: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    await simulateDelay()
    
    let filtered = [...mockProducts]
    
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.farmerName.toLowerCase().includes(search)
      )
    }
    
    if (filters?.category) {
      filtered = filtered.filter(p => p.category === filters.category)
    }
    
    if (filters?.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.minPrice!)
    }
    
    if (filters?.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice!)
    }
    
    if (filters?.location) {
      filtered = filtered.filter(p => p.location.includes(filters.location!))
    }
    
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          filtered.sort((a, b) => a.price - b.price)
          break
        case 'price_desc':
          filtered.sort((a, b) => b.price - a.price)
          break
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating)
          break
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          break
      }
    }
    
    return {
      data: filtered,
      total: filtered.length,
      page: 1,
      perPage: 20,
      totalPages: 1,
    }
  },
  
  getById: async (id: string): Promise<ApiResponse<Product>> => {
    await simulateDelay()
    const product = mockProducts.find(p => p.id === id)
    
    if (!product) {
      return {
        success: false,
        message: 'Product not found',
        data: null as unknown as Product,
      }
    }
    
    return {
      success: true,
      data: product,
    }
  },
  
  create: async (data: Partial<Product>): Promise<ApiResponse<Product>> => {
    await simulateDelay()
    
    const newProduct: Product = {
      id: 'prod-' + Date.now(),
      farmerId: 'farmer-1',
      farmerName: 'Green Valley Farm',
      farmerRating: 4.8,
      name: data.name!,
      description: data.description!,
      category: data.category!,
      images: data.images || [],
      price: data.price!,
      unit: data.unit!,
      stock: data.stock!,
      moq: data.moq || 1,
      harvestDate: data.harvestDate || new Date().toISOString(),
      location: data.location || 'California, USA',
      certifications: data.certifications || [],
      rating: 0,
      totalReviews: 0,
      status: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    return {
      success: true,
      data: newProduct,
      message: 'Product created successfully',
    }
  },
  
  update: async (id: string, data: Partial<Product>): Promise<ApiResponse<Product>> => {
    await simulateDelay()
    
    const product = mockProducts.find(p => p.id === id)
    if (!product) {
      return {
        success: false,
        message: 'Product not found',
        data: null as unknown as Product,
      }
    }
    
    const updated = { ...product, ...data, updatedAt: new Date().toISOString() }
    
    return {
      success: true,
      data: updated,
      message: 'Product updated successfully',
    }
  },
  
  delete: async (_id: string): Promise<ApiResponse<null>> => {
    await simulateDelay()
    
    return {
      success: true,
      data: null,
      message: 'Product deleted successfully',
    }
  },
}

// ==========================================
// ORDERS API - MOCK IMPLEMENTATION
// ==========================================
export const ordersApi = {
  getAll: async (filters?: OrderFilters): Promise<PaginatedResponse<Order>> => {
    await simulateDelay()
    
    let filtered = [...mockOrders]
    
    if (filters?.status) {
      filtered = filtered.filter(o => o.status === filters.status)
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(search) ||
        o.buyerName.toLowerCase().includes(search)
      )
    }
    
    return {
      data: filtered,
      total: filtered.length,
      page: 1,
      perPage: 20,
      totalPages: 1,
    }
  },
  
  getById: async (id: string): Promise<ApiResponse<Order>> => {
    await simulateDelay()
    const order = mockOrders.find(o => o.id === id)
    
    if (!order) {
      return {
        success: false,
        message: 'Order not found',
        data: null as unknown as Order,
      }
    }
    
    return {
      success: true,
      data: order,
    }
  },
  
  create: async (data: Partial<Order>): Promise<ApiResponse<Order>> => {
    await simulateDelay()
    
    const newOrder: Order = {
      id: 'order-' + Date.now(),
      buyerId: 'buyer-1',
      buyerName: 'Fresh Market Co.',
      farmerId: 'farmer-1',
      farmerName: 'Green Valley Farm',
      items: data.items || [],
      totalAmount: data.totalAmount || 0,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: data.paymentMethod || 'escrow',
      shippingAddress: data.shippingAddress!,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    return {
      success: true,
      data: newOrder,
      message: 'Order created successfully',
    }
  },
  
  updateStatus: async (id: string, status: Order['status']): Promise<ApiResponse<Order>> => {
    await simulateDelay()
    
    const order = mockOrders.find(o => o.id === id)
    if (!order) {
      return {
        success: false,
        message: 'Order not found',
        data: null as unknown as Order,
      }
    }
    
    const updated = { ...order, status, updatedAt: new Date().toISOString() }
    
    return {
      success: true,
      data: updated,
      message: 'Order status updated',
    }
  },
}

// ==========================================
// FARMER API - MOCK IMPLEMENTATION
// ==========================================
export const farmerApi = {
  getProfile: async (): Promise<ApiResponse<FarmerProfile>> => {
    await simulateDelay()
    
    return {
      success: true,
      data: mockFarmers[0],
    }
  },
  
  updateProfile: async (data: Partial<FarmerProfile>): Promise<ApiResponse<FarmerProfile>> => {
    await simulateDelay()
    
    const updated = { ...mockFarmers[0], ...data, updatedAt: new Date().toISOString() }
    
    return {
      success: true,
      data: updated,
      message: 'Profile updated successfully',
    }
  },
  
  getDashboardStats: async (): Promise<ApiResponse<typeof mockFarmerStats>> => {
    await simulateDelay()
    
    return {
      success: true,
      data: mockFarmerStats,
    }
  },
  
  getHarvestSchedules: async (): Promise<ApiResponse<HarvestSchedule[]>> => {
    await simulateDelay()
    
    return {
      success: true,
      data: mockHarvestSchedules.filter(h => h.farmerId === 'farmer-1'),
    }
  },
  
  createHarvestSchedule: async (data: Partial<HarvestSchedule>): Promise<ApiResponse<HarvestSchedule>> => {
    await simulateDelay()
    
    const newSchedule: HarvestSchedule = {
      id: 'harvest-' + Date.now(),
      farmerId: 'farmer-1',
      cropName: data.cropName!,
      fieldLocation: data.fieldLocation!,
      plantingDate: data.plantingDate!,
      expectedHarvestDate: data.expectedHarvestDate!,
      estimatedYield: data.estimatedYield!,
      unit: data.unit!,
      status: 'planned',
      notes: data.notes,
    }
    
    return {
      success: true,
      data: newSchedule,
      message: 'Harvest schedule created',
    }
  },
  
  getAnalytics: async (): Promise<ApiResponse<{ monthlySales: typeof mockMonthlySales; topProducts: typeof mockTopProducts }>> => {
    await simulateDelay()
    
    return {
      success: true,
      data: {
        monthlySales: mockMonthlySales,
        topProducts: mockTopProducts,
      },
    }
  },
  
  getEarnings: async (): Promise<ApiResponse<{ total: number; available: number; escrow: number; withdrawals: typeof mockWithdrawals }>> => {
    await simulateDelay()
    
    return {
      success: true,
      data: {
        total: mockFarmerStats.totalSales,
        available: mockFarmerStats.totalSales - mockFarmerStats.escrowBalance - 1250,
        escrow: mockFarmerStats.escrowBalance,
        withdrawals: mockWithdrawals,
      },
    }
  },
  
  requestWithdrawal: async (amount: number): Promise<ApiResponse<typeof mockWithdrawals[0]>> => {
    await simulateDelay()
    
    const newWithdrawal = {
      id: 'withdrawal-' + Date.now(),
      amount,
      status: 'pending' as const,
      bankAccount: '****4521',
      createdAt: new Date().toISOString(),
    }
    
    return {
      success: true,
      data: newWithdrawal,
      message: 'Withdrawal request submitted',
    }
  },
}

// ==========================================
// BUYER API - MOCK IMPLEMENTATION
// ==========================================
export const buyerApi = {
  getProfile: async (): Promise<ApiResponse<typeof mockBuyers[0]>> => {
    await simulateDelay()
    
    return {
      success: true,
      data: mockBuyers[0],
    }
  },
  
  getDashboardStats: async (): Promise<ApiResponse<typeof mockBuyerStats>> => {
    await simulateDelay()
    
    return {
      success: true,
      data: mockBuyerStats,
    }
  },
}

// ==========================================
// NOTIFICATIONS API - MOCK IMPLEMENTATION
// ==========================================
export const notificationsApi = {
  getAll: async (): Promise<ApiResponse<typeof mockNotifications>> => {
    await simulateDelay()
    
    return {
      success: true,
      data: mockNotifications,
    }
  },
  
  markAsRead: async (_id: string): Promise<ApiResponse<null>> => {
    await simulateDelay(200)
    
    return {
      success: true,
      data: null,
      message: 'Notification marked as read',
    }
  },
  
  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    await simulateDelay(200)
    
    return {
      success: true,
      data: null,
      message: 'All notifications marked as read',
    }
  },
}

export default api
