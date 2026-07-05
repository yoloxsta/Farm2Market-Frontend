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

// Create axios instance connecting to NestJS backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token to all requests
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

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ==========================================
// AUTH API
// ==========================================
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },
  
  // Self-registration - user will be pending approval
  register: async (data: Partial<User> & { password: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/register', data)
    return response.data
  },
  
  // Admin only: Create a new user (farmer or buyer) - auto-approved
  createUser: async (data: Partial<User> & { password: string; role: 'farmer' | 'buyer'; farmName?: string; companyName?: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/create-user', data)
    return response.data
  },
  
  // Admin only: Get all users
  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get('/auth/users')
    return response.data
  },
  
  // Admin only: Delete a user
  deleteUser: async (userId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/auth/users/${userId}`)
    return response.data
  },
  
  // Admin only: Update user password
  updateUserPassword: async (userId: string, password: string): Promise<ApiResponse<null>> => {
    const response = await api.patch(`/auth/users/${userId}/password`, { password })
    return response.data
  },
  
  // Admin only: Update user info
  updateUser: async (userId: string, data: { name?: string; email?: string }): Promise<ApiResponse<User>> => {
    const response = await api.patch(`/auth/users/${userId}`, data)
    return response.data
  },
  
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await api.post('/auth/logout')
    return response.data
  },
  
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

// ==========================================
// ADMIN API
// ==========================================
export const adminApi = {
  // User Approval
  getPendingUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get('/admin/users/pending')
    return response.data
  },
  
  approveUser: async (userId: string): Promise<ApiResponse<null>> => {
    const response = await api.post(`/admin/users/${userId}/approve`)
    return response.data
  },
  
  rejectUser: async (userId: string): Promise<ApiResponse<null>> => {
    const response = await api.post(`/admin/users/${userId}/reject`)
    return response.data
  },
  
  // Product Approval
  getPendingProducts: async (): Promise<ApiResponse<Product[]>> => {
    const response = await api.get('/admin/products/pending')
    return response.data
  },
  
  approveProduct: async (productId: string): Promise<ApiResponse<null>> => {
    const response = await api.post(`/admin/products/${productId}/approve`)
    return response.data
  },
  
  rejectProduct: async (productId: string): Promise<ApiResponse<null>> => {
    const response = await api.post(`/admin/products/${productId}/reject`)
    return response.data
  },
  
  // Escrow Management
  getEscrowPayments: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/admin/escrow')
    return response.data
  },
  
  getHeldEscrowPayments: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/admin/escrow/held')
    return response.data
  },
  
  getEscrowStats: async (): Promise<ApiResponse<{
    totalHeld: number
    totalReleased: number
    heldCount: number
    releasedCount: number
  }>> => {
    const response = await api.get('/admin/escrow/stats')
    return response.data
  },
  
  releaseEscrow: async (paymentId: string): Promise<ApiResponse<null>> => {
    const response = await api.post(`/admin/escrow/${paymentId}/release`)
    return response.data
  },
}

// ==========================================
// PRODUCTS API
// ==========================================
export const productsApi = {
  getAll: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    const response = await api.get('/products', { params: filters })
    return response.data
  },
  
  getById: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },
  
  create: async (data: Partial<Product>): Promise<ApiResponse<Product>> => {
    const response = await api.post('/products', data)
    return response.data
  },
  
  update: async (id: string, data: Partial<Product>): Promise<ApiResponse<Product>> => {
    const response = await api.put(`/products/${id}`, data)
    return response.data
  },
  
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/products/${id}`)
    return response.data
  },
  
  updateStock: async (id: string, stock: number): Promise<ApiResponse<Product>> => {
    const response = await api.patch(`/products/${id}/stock`, { stock })
    return response.data
  },
}

// ==========================================
// ORDERS API
// ==========================================
export const ordersApi = {
  getAll: async (filters?: OrderFilters): Promise<PaginatedResponse<Order>> => {
    const response = await api.get('/orders', { params: filters })
    return response.data
  },
  
  getById: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },
  
  create: async (data: Partial<Order>): Promise<ApiResponse<Order>> => {
    const response = await api.post('/orders', data)
    return response.data
  },
  
  updateStatus: async (id: string, status: Order['status']): Promise<ApiResponse<Order>> => {
    const response = await api.patch(`/orders/${id}/status`, { status })
    return response.data
  },
  
  cancel: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await api.post(`/orders/${id}/cancel`)
    return response.data
  },
}

// ==========================================
// FARMER API
// ==========================================
export const farmerApi = {
  getProfile: async (): Promise<ApiResponse<FarmerProfile>> => {
    const response = await api.get('/farmer/profile')
    return response.data
  },
  
  updateProfile: async (data: Partial<FarmerProfile>): Promise<ApiResponse<FarmerProfile>> => {
    const response = await api.put('/farmer/profile', data)
    return response.data
  },
  
  getDashboardStats: async (): Promise<ApiResponse<{
    totalProducts: number
    activeOrders: number
    totalSales: number
    escrowBalance: number
  }>> => {
    const response = await api.get('/farmer/dashboard')
    return response.data
  },
  
  getHarvestSchedules: async (): Promise<ApiResponse<HarvestSchedule[]>> => {
    const response = await api.get('/farmer/harvest-schedules')
    return response.data
  },
  
  createHarvestSchedule: async (data: Partial<HarvestSchedule>): Promise<ApiResponse<HarvestSchedule>> => {
    const response = await api.post('/farmer/harvest-schedules', data)
    return response.data
  },
  
  updateHarvestSchedule: async (id: string, data: Partial<HarvestSchedule>): Promise<ApiResponse<HarvestSchedule>> => {
    const response = await api.put(`/farmer/harvest-schedules/${id}`, data)
    return response.data
  },
  
  deleteHarvestSchedule: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/farmer/harvest-schedules/${id}`)
    return response.data
  },
  
  getAnalytics: async (): Promise<ApiResponse<{
    monthlySales: { month: string; sales: number; orders: number }[]
    topProducts: { name: string; sales: number }[]
  }>> => {
    const response = await api.get('/farmer/analytics')
    return response.data
  },
  
  getEarnings: async (): Promise<ApiResponse<{
    total: number
    available: number
    escrow: number
    withdrawals: {
      id: string
      amount: number
      status: string
      bankAccount: string
      createdAt: string
      processedAt?: string
    }[]
  }>> => {
    const response = await api.get('/farmer/earnings')
    return response.data
  },
  
  requestWithdrawal: async (amount: number): Promise<ApiResponse<{
    id: string
    amount: number
    status: string
    bankAccount: string
    createdAt: string
  }>> => {
    const response = await api.post('/farmer/withdrawals', { amount })
    return response.data
  },
}

// ==========================================
// BUYER API
// ==========================================
export const buyerApi = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/buyer/profile')
    return response.data
  },
  
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put('/buyer/profile', data)
    return response.data
  },
  
  getDashboardStats: async (): Promise<ApiResponse<{
    totalOrders: number
    pendingDeliveries: number
    totalSpent: number
  }>> => {
    const response = await api.get('/buyer/dashboard')
    return response.data
  },
  
  getCart: async (): Promise<ApiResponse<{ items: { product: Product; quantity: number }[]; total: number }>> => {
    const response = await api.get('/buyer/cart')
    return response.data
  },
  
  addToCart: async (productId: string, quantity: number): Promise<ApiResponse<null>> => {
    const response = await api.post('/buyer/cart', { productId, quantity })
    return response.data
  },
  
  removeFromCart: async (productId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/buyer/cart/${productId}`)
    return response.data
  },
  
  updateCartItem: async (productId: string, quantity: number): Promise<ApiResponse<null>> => {
    const response = await api.put(`/buyer/cart/${productId}`, { quantity })
    return response.data
  },
  
  clearCart: async (): Promise<ApiResponse<null>> => {
    const response = await api.delete('/buyer/cart')
    return response.data
  },
}

// ==========================================
// NOTIFICATIONS API
// ==========================================
export const notificationsApi = {
  getAll: async (): Promise<ApiResponse<{
    id: string
    userId: string
    title: string
    message: string
    type: string
    read: boolean
    createdAt: string
  }[]>> => {
    const response = await api.get('/notifications')
    return response.data
  },
  
  markAsRead: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.patch(`/notifications/${id}/read`)
    return response.data
  },
  
  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    const response = await api.post('/notifications/read-all')
    return response.data
  },
}

// ==========================================
// FILE UPLOAD API
// ==========================================
export const uploadApi = {
  uploadImage: async (file: File): Promise<ApiResponse<{ url: string; path: string }>> => {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  
  uploadMultipleImages: async (files: File[]): Promise<ApiResponse<{ urls: string[] }>> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('images', file)
    })
    
    const response = await api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
}

export default api
