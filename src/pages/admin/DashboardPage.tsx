import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Package, Wallet } from 'lucide-react'
import UserApprovalTab from './UserApprovalTab'
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
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Approval
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
