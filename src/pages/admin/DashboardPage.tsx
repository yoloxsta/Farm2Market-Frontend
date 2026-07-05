import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Package, Wallet, UserCog } from 'lucide-react'
import UserApprovalTab from './UserApprovalTab'
import UserManagementTab from './UserManagementTab'
import ProductApprovalTab from './ProductApprovalTab'
import EscrowManagementTab from './EscrowManagementTab'

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, products, and escrow payments</p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Approval
          </TabsTrigger>
          <TabsTrigger value="user-management" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Product Approval
          </TabsTrigger>
          <TabsTrigger value="escrow" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Escrow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserApprovalTab />
        </TabsContent>

        <TabsContent value="user-management">
          <UserManagementTab />
        </TabsContent>

        <TabsContent value="products">
          <ProductApprovalTab />
        </TabsContent>

        <TabsContent value="escrow">
          <EscrowManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
