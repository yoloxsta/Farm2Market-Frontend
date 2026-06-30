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
        path: 'orders',
        element: <BuyerShop />, // Placeholder - could create BuyerOrdersPage
      },
      {
        path: 'deliveries',
        element: <BuyerShop />, // Placeholder
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
