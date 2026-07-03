import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  BarChart3,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Sun,
  Moon,
  Leaf,
  User,
  ShoppingBag,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks'
import { buyerApi } from '@/services/api'
import type { UserRole } from '@/types'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles: UserRole[]
}

const farmerNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/farmer', icon: LayoutDashboard, roles: ['farmer'] },
  { label: 'Products', href: '/farmer/products', icon: Package, roles: ['farmer'] },
  { label: 'Orders', href: '/farmer/orders', icon: ShoppingCart, roles: ['farmer'] },
  { label: 'Farm', href: '/farmer/farm', icon: Leaf, roles: ['farmer'] },
  { label: 'Earnings', href: '/farmer/earnings', icon: Wallet, roles: ['farmer'] },
  { label: 'Analytics', href: '/farmer/analytics', icon: BarChart3, roles: ['farmer'] },
]

const buyerNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/buyer', icon: LayoutDashboard, roles: ['buyer'] },
  { label: 'Shop', href: '/buyer/shop', icon: ShoppingBag, roles: ['buyer'] },
  { label: 'Orders', href: '/buyer/orders', icon: Package, roles: ['buyer'] },
  { label: 'Deliveries', href: '/buyer/deliveries', icon: Truck, roles: ['buyer'] },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Get cart count for buyer
  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => buyerApi.getCart(),
    enabled: user?.role === 'buyer',
  })

  const cartItemCount = cartData?.data?.items?.length || 0

  const navItems = user?.role === 'farmer' ? farmerNavItems : buyerNavItems

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={cn('min-h-screen bg-muted/30', darkMode && 'dark')}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 transform bg-card shadow-lg transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Link to="/" className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">Farm2Market</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Bottom section */}
          <div className="border-t p-4">
            <Link
              to="/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 shadow-sm">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search bar */}
          <div className="relative hidden flex-1 md:block md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products, orders..."
              className="pl-10"
            />
          </div>

          <div className="flex flex-1 items-center justify-end gap-2">
            {/* Cart button for buyers */}
            {user?.role === 'buyer' && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => navigate('/buyer/cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* Dark mode toggle */}
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">New Order Received</p>
                    <p className="text-xs text-muted-foreground">
                      Order #order-3 from Fresh Market Co.
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Payment Released</p>
                    <p className="text-xs text-muted-foreground">
                      $274.20 added to your balance
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-primary">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>
                      {user ? getInitials(user.name) : <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
