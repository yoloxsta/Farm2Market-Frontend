import { Outlet, Link } from 'react-router-dom'
import { Leaf, Truck, Users, Shield, TrendingUp, Sprout } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Beautiful Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full" />
          <div className="absolute top-40 right-20 w-24 h-24 border-2 border-white rounded-full" />
          <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-white rounded-full" />
          <div className="absolute bottom-40 right-10 w-16 h-16 border-2 border-white rounded-full" />
        </div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-20 right-20 opacity-20">
          <Sprout className="w-24 h-24 text-white" />
        </div>
        <div className="absolute bottom-32 left-16 opacity-15">
          <Leaf className="w-32 h-32 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <Link to="/" className="flex items-center gap-3 mb-6 group">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-all">
              <Leaf className="h-10 w-10" />
            </div>
            <span className="text-4xl font-bold tracking-tight">Farm2Market</span>
          </Link>
          
          <h1 className="text-4xl font-extrabold text-center mb-3 tracking-tight">
            Farm Fresh,<br />Direct to You
          </h1>
          <p className="text-lg text-center text-emerald-100 max-w-md mb-10 leading-relaxed">
            Connecting farmers directly with buyers. No middlemen, just fresh produce at fair prices.
          </p>
          
          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all">
              <Truck className="h-8 w-8 mb-3 text-emerald-200" />
              <div className="text-2xl font-bold">Fast Delivery</div>
              <div className="text-sm text-emerald-200">Farm to doorstep</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all">
              <Users className="h-8 w-8 mb-3 text-emerald-200" />
              <div className="text-2xl font-bold">10K+ Farmers</div>
              <div className="text-sm text-emerald-200">Verified sellers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all">
              <Shield className="h-8 w-8 mb-3 text-emerald-200" />
              <div className="text-2xl font-bold">100% Secure</div>
              <div className="text-sm text-emerald-200">Escrow protection</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all">
              <TrendingUp className="h-8 w-8 mb-3 text-emerald-200" />
              <div className="text-2xl font-bold">$2M+</div>
              <div className="text-sm text-emerald-200">Monthly trades</div>
            </div>
          </div>
        </div>
        
        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-24 fill-white/10">
            <path d="M0,64 C480,150 960,-20 1440,64 L1440,120 L0,120 Z" />
          </svg>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Leaf className="h-8 w-8 text-emerald-600" />
            </div>
            <span className="text-2xl font-bold text-emerald-600">Farm2Market</span>
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  )
}
