import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { farmerApi } from '@/services/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PageLoader } from '@/components/shared/LoadingSpinner'

export default function EarningsPage() {
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['farmer-earnings'],
    queryFn: () => farmerApi.getEarnings(),
  })

  const withdrawMutation = useMutation({
    mutationFn: (amount: number) => farmerApi.requestWithdrawal(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-earnings'] })
      toast({
        title: 'Withdrawal requested',
        description: 'Your withdrawal request has been submitted.',
      })
      setWithdrawDialogOpen(false)
      setWithdrawAmount('')
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to request withdrawal',
      })
    },
  })

  if (isLoading) {
    return <PageLoader />
  }

  const earnings = data?.data
  const withdrawals = earnings?.withdrawals || []

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid amount',
        description: 'Please enter a valid amount.',
      })
      return
    }
    if (amount > (earnings?.available || 0)) {
      toast({
        variant: 'destructive',
        title: 'Insufficient balance',
        description: 'Amount exceeds available balance.',
      })
      return
    }
    withdrawMutation.mutate(amount)
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
        <p className="text-muted-foreground">Track your earnings and withdrawals</p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Earnings</p>
            <p className="text-3xl font-bold">{formatCurrency(earnings?.total || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Available to Withdraw</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(earnings?.available || 0)}</p>
            <Button 
              className="mt-2" 
              size="sm"
              onClick={() => setWithdrawDialogOpen(true)}
              disabled={(earnings?.available || 0) <= 0}
            >
              Withdraw
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">In Escrow (Pending)</p>
            <p className="text-3xl font-bold text-orange-600">{formatCurrency(earnings?.escrow || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Released after delivery</p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length > 0 ? (
            <div className="space-y-3">
              {withdrawals.map((withdrawal: any) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-semibold">{formatCurrency(withdrawal.amount)}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(withdrawal.created_at || withdrawal.createdAt)}</p>
                  </div>
                  <Badge className={statusColors[withdrawal.status]}>
                    {withdrawal.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No withdrawals yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>
              Available: {formatCurrency(earnings?.available || 0)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (K)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWithdrawAmount(String(Math.floor((earnings?.available || 0) * 0.25)))}
              >
                25%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWithdrawAmount(String(Math.floor((earnings?.available || 0) * 0.5)))}
              >
                50%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWithdrawAmount(String(Math.floor((earnings?.available || 0) * 0.75)))}
              >
                75%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWithdrawAmount(String(earnings?.available || 0))}
              >
                All
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={withdrawMutation.isPending}
            >
              {withdrawMutation.isPending ? 'Processing...' : 'Withdraw'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
