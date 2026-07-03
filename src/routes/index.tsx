import { createBrowserRouter, Navigate } from 'react-router-dom'
import { DashboardLayout, AuthLayout } from '@/layouts'
import ProtectedRoute from './ProtectedRoute'

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

// Farmer Pages
import FarmerDashboard from '@/pages/farmer/DashboardPage'
import FarmerProducts from '@/pages/farmer/ProductsPage'
import FarmerOrders from '@/pages/farmer/OrdersPage'
import FarmerFarm from '@/pages/farmer/FarmPage'
import FarmerEarnings from '@/pages/farmer/EarningsPage'
import FarmerAnalytics from '@/pages/farmer/AnalyticsPage'

// Buyer Pages
import BuyerDashboard from '@/pages/buyer/DashboardPage'
import BuyerShop from '@/pages/buyer/ShopPage'
import BuyerProductDetail from '@/pages/buyer/ProductDetailPage'
import BuyerCart from '@/pages/buyer/CartPage'
import BuyerCheckout from '@/pages/buyer/CheckoutPage'
import BuyerOrders from '@/pages/buyer/OrdersPage'
import BuyerDeliveries from '@/pages/buyer/DeliveriesPage'

// Error Pages
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: 'farmer',
    element: (
      <ProtectedRoute allowedRoles={['farmer']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <FarmerDashboard />,
      },
      {
        path: 'products',
        element: <FarmerProducts />,
      },
      {
        path: 'orders',
        element: <FarmerOrders />,
      },
      {
        path: 'farm',
        element: <FarmerFarm />,
      },
      {
        path: 'earnings',
        element: <FarmerEarnings />,
      },
      {
        path: 'analytics',
        element: <FarmerAnalytics />,
      },
    ],
  },
  {
    path: 'buyer',
    element: (
      <ProtectedRoute allowedRoles={['buyer']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <BuyerDashboard />,
      },
      {
        path: 'shop',
        element: <BuyerShop />,
      },
      {
        path: 'products/:id',
        element: <BuyerProductDetail />,
      },
      {
        path: 'cart',
        element: <BuyerCart />,
      },
      {
        path: 'checkout',
        element: <BuyerCheckout />,
      },
      {
        path: 'orders',
        element: <BuyerOrders />,
      },
      {
        path: 'deliveries',
        element: <BuyerDeliveries />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
