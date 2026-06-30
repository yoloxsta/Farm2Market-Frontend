import { Outlet, Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-900 opacity-90" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <Link to="/" className="flex items-center gap-3 mb-8">
            <Leaf className="h-12 w-12" />
            <span className="text-4xl font-bold">Farm2Market</span>
          </Link>
          <h1 className="text-3xl font-bold text-center mb-4">
            Connect Farm to Market
          </h1>
          <p className="text-lg text-center text-primary-100 max-w-md">
            The premier B2B agriculture marketplace connecting farmers directly with buyers.
            Fresh produce, fair prices, transparent transactions.
          </p>
          
          {/* Features */}
          <div className="mt-12 grid grid-cols-2 gap-6 max-w-lg">
            <div className="text-center">
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm text-primary-100">Active Farmers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">5K+</div>
              <div className="text-sm text-primary-100">Verified Buyers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">$2M+</div>
              <div className="text-sm text-primary-100">Monthly Sales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">98%</div>
              <div className="text-sm text-primary-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-secondary rounded-full opacity-20" />
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-secondary rounded-full opacity-10" />
      </div>

      {/* Right side - Auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Farm2Market</span>
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  )
}
