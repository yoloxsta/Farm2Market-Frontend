import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Leaf, ShoppingBag, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['farmer', 'buyer']),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { login, isLoading } = useAuth()
  const [searchParams] = useSearchParams()
  const roleFromUrl = searchParams.get('role')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: (roleFromUrl === 'farmer' || roleFromUrl === 'buyer') ? roleFromUrl : 'farmer',
    },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data.email, data.password, data.role)
    
    if (result.success) {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      })
      
      // Navigate based on user role
      const user = useAuth.getState().user
      if (user?.role === 'admin') {
        navigate('/admin')
      } else if (user?.role === 'farmer') {
        navigate('/farmer')
      } else {
        navigate('/buyer')
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: result.message || 'Invalid credentials. Please try again.',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in to your Farm2Market account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role Selection */}
        <div className="space-y-2">
          <Label>Login as</Label>
          <div className="grid grid-cols-2 gap-4">
            <label
              htmlFor="role-farmer"
              className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all ${
                selectedRole === 'farmer'
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-muted hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <input
                type="radio"
                id="role-farmer"
                value="farmer"
                className="sr-only"
                {...register('role')}
              />
              <Leaf className={`h-8 w-8 mb-2 ${selectedRole === 'farmer' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="font-semibold">Farmer</span>
              <span className="text-xs text-muted-foreground mt-1">Sell your products</span>
            </label>
            <label
              htmlFor="role-buyer"
              className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all ${
                selectedRole === 'buyer'
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-muted hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <input
                type="radio"
                id="role-buyer"
                value="buyer"
                className="sr-only"
                {...register('role')}
              />
              <ShoppingBag className={`h-8 w-8 mb-2 ${selectedRole === 'buyer' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="font-semibold">Buyer</span>
              <span className="text-xs text-muted-foreground mt-1">Buy fresh products</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            {...register('email')}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            `Sign in as ${selectedRole === 'farmer' ? 'Farmer' : 'Buyer'}`
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">New to Farm2Market?</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" asChild>
          <Link to="/register?role=farmer">
            <Leaf className="mr-2 h-4 w-4 text-green-600" />
            Register as Farmer
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/register?role=buyer">
            <ShoppingBag className="mr-2 h-4 w-4 text-blue-600" />
            Register as Buyer
          </Link>
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Note: New accounts require admin approval before login.
      </p>
    </div>
  )
}
