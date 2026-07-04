import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Wallet, ArrowUpRight, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { adminApi } from '@/services/api'
import { socketService } from '@/services/socket'

export default function EscrowManagementTab() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Listen for real-time updates
  useEffect(() => {
    socketService.onNewEscrowPayment((payment) => {
      toast({ title: 'New Escrow Payment', description: `$${payment.amount} held in escrow.` })
      queryClient.invalidateQueries({ queryKey: ['escrow-stats'] })
      queryClient.invalidateQueries({ queryKey: ['escrow-payments'] })
    })

    socketService.onEscrowReleased((payment) => {
      toast({ title: 'Escrow Released', description: `$${payment.amount} released to farmer.` })
      queryClient.invalidateQueries({ queryKey: ['escrow-stats'] })
      queryClient.invalidateQueries({ queryKey: ['escrow-payments'] })
    })

    return () => {
      socketService.removeEventListeners('admin:escrow:created')
      socketService.removeEventListeners('admin:escrow:released')
    }
  }, [])

  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['escrow-stats'],
    queryFn: () => adminApi.getEscrowStats(),
  })

  const { data: paymentsData, isLoading: loadingPayments } = useQuery({
    queryKey: ['escrow-payments'],
    queryFn: () => adminApi.getEscrowPayments(),
  })

  const releaseMutation = useMutation({
    mutationFn: (paymentId: string) => adminApi.releaseEscrow(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrow-stats'] })
      queryClient.invalidateQueries({ queryKey: ['escrow-payments'] })
      toast({ title: 'Escrow released', description: 'Payment has been released to farmer.' })
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message })
    },
  })

  const stats = statsData?.data || { totalHeld: 0, totalReleased: 0, heldCount: 0, releasedCount: 0 }
  const payments = paymentsData?.data || []
  const heldPayments = payments.filter((p: any) => p.status === 'held')

  if (loadingStats || loadingPayments) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-100">
                <Wallet className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Held in Escrow</p>
                <p className="text-2xl font-bold">${stats.totalHeld.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{stats.heldCount} payments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <ArrowUpRight className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Released to Farmers</p>
                <p className="text-2xl font-bold">${stats.totalReleased.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{stats.releasedCount} payments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Held Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Held Payments ({heldPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {heldPayments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No held payments</p>
          ) : (
            <div className="divide-y">
              {heldPayments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-yellow-100">
                      <DollarSign className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">${payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        Order from {payment.buyer?.name || 'Unknown'} to {payment.farmer?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Held since {new Date(payment.held_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Held</Badge>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => releaseMutation.mutate(payment.id)}
                      disabled={releaseMutation.isPending}
                    >
                      {releaseMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Releasing...
                        </>
                      ) : (
                        'Release to Farmer'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Payments History */}
      <Card>
        <CardHeader>
          <CardTitle>All Payments ({payments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No payments yet</p>
          ) : (
            <div className="divide-y">
              {payments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${payment.status === 'held' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                      <DollarSign className={`h-4 w-4 ${payment.status === 'held' ? 'text-yellow-600' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <p className="font-medium">${payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.buyer?.name || 'Unknown'} → {payment.farmer?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={payment.status === 'held' ? 'secondary' : 'default'}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
