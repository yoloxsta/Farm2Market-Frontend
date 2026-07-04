import { Users, Leaf, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Self-registration is disabled - only admins can create users
export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Registration Disabled</h1>
        <p className="text-muted-foreground">
          Self-registration is not available
        </p>
      </div>

      <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/50">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Contact Your Administrator</h2>
        <p className="text-center text-muted-foreground mb-6">
          To create a farmer or buyer account, please contact your system administrator.
          Only administrators can create new accounts.
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">
          If you already have an account, sign in below:
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" asChild>
            <a href="/login?role=farmer">
              <Leaf className="mr-2 h-4 w-4 text-green-600" />
              Sign in as Farmer
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/login?role=buyer">
              <ShoppingBag className="mr-2 h-4 w-4 text-blue-600" />
              Sign in as Buyer
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
