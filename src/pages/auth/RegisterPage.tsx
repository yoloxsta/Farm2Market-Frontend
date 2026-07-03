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

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['farmer', 'buyer']),
  companyName: z.string().optional(),
  farmName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { register: registerUser, isLoading } = useAuth()
  const [searchParams] = useSearchParams()
  const roleFromUrl = searchParams.get('role')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: (roleFromUrl === 'farmer' || roleFromUrl === 'buyer') ? roleFromUrl : 'farmer',
    },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterFormData) => {
    const result = await registerUser(data)
    
    if (result.success) {
      toast({
        title: 'Account created!',
        description: 'Please login with your credentials.',
      })
      navigate(`/login?role=${data.role}`)
    } else {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: result.message || 'Something went wrong. Please try again.',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Create an account</h1>
        <p className="text-muted-foreground">
          Join Farm2Market today
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role Selection */}
        <div className="space-y-2">
          <Label>I want to</Label>
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
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="John Smith"
            {...register('name')}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {selectedRole === 'farmer' && (
          <div className="space-y-2">
            <Label htmlFor="farmName">Farm Name (Optional)</Label>
            <Input
              id="farmName"
              placeholder="Green Valley Farm"
              {...register('farmName')}
              disabled={isLoading}
            />
          </div>
        )}

        {selectedRole === 'buyer' && (
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name (Optional)</Label>
            <Input
              id="companyName"
              placeholder="Fresh Market Co."
              {...register('companyName')}
              disabled={isLoading}
            />
          </div>
        )}

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
          <Label htmlFor="password">Password</Label>
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            `Register as ${selectedRole === 'farmer' ? 'Farmer' : 'Buyer'}`
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Already have an account?</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" asChild>
          <Link to="/login?role=farmer">
            <Leaf className="mr-2 h-4 w-4 text-green-600" />
            Sign in as Farmer
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/login?role=buyer">
            <ShoppingBag className="mr-2 h-4 w-4 text-blue-600" />
            Sign in as Buyer
          </Link>
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        By creating an account, you agree to our{' '}
        <Link to="/terms" className="underline hover:text-primary">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/privacy" className="underline hover:text-primary">
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}
