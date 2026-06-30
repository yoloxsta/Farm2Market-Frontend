import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Wallet, TrendingUp, Clock, ArrowUpRight, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
import { StatisticCard } from '@/components/shared'

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
        description: 'Your withdrawal request has been submitted for processing.',
      })
      setWithdrawDialogOpen(false)
      setWithdrawAmount('')
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
        description: 'Please enter a valid withdrawal amount.',
      })
      return
    }
    if (amount > (earnings?.available || 0)) {
      toast({
        variant: 'destructive',
        title: 'Insufficient balance',
        description: 'You cannot withdraw more than your available balance.',
      })
      return
    }
    withdrawMutation.mutate(amount)
  }

  const withdrawalStatusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
          <p className="text-muted-foreground">
            Track your earnings and manage withdrawals
          </p>
        </div>
        <Button onClick={() => setWithdrawDialogOpen(true)}>
          <ArrowUpRight className="mr-2 h-4 w-4" />
          Request Withdrawal
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatisticCard
          title="Total Earnings"
          value={formatCurrency(earnings?.total || 0)}
          icon={DollarSign}
          trend={{ value: 12, isPositive: true }}
        />
        <StatisticCard
          title="Available Balance"
          value={formatCurrency(earnings?.available || 0)}
          icon={Wallet}
          description="Ready to withdraw"
        />
        <StatisticCard
          title="Escrow Balance"
          value={formatCurrency(earnings?.escrow || 0)}
          icon={Clock}
          description="Pending release"
        />
        <StatisticCard
          title="Pending Withdrawals"
          value={formatCurrency(earnings?.withdrawals?.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0) || 0)}
          icon={TrendingUp}
          description="Processing"
        />
      </div>

      {/* Balance overview */}
      <Card>
        <CardHeader>
          <CardTitle>Balance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available for Withdrawal</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(earnings?.available || 0)}
                </p>
              </div>
              <Button onClick={() => setWithdrawDialogOpen(true)}>
                Withdraw
              </Button>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">In Escrow</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(earnings?.escrow || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Funds will be released after delivery confirmation
                </p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Bank Account</p>
                <p className="text-xl font-semibold">****4521</p>
                <Button variant="link" className="h-auto p-0 text-xs">
                  Change account
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal history */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length > 0 ? (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <ArrowUpRight className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {formatCurrency(withdrawal.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(withdrawal.createdAt)} • {withdrawal.bankAccount}
                      </p>
                    </div>
                  </div>
                  <Badge className={withdrawalStatusColors[withdrawal.status]}>
                    {withdrawal.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No withdrawal history</p>
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
              Enter the amount you want to withdraw to your bank account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold">
                {formatCurrency(earnings?.available || 0)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-8"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Withdraw to</Label>
              <div className="rounded-lg border p-4">
                <p className="font-medium">Bank Account</p>
                <p className="text-sm text-muted-foreground">****4521</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setWithdrawAmount(((earnings?.available || 0) * 0.25).toFixed(2))}
              >
                25%
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setWithdrawAmount(((earnings?.available || 0) * 0.5).toFixed(2))}
              >
                50%
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setWithdrawAmount(((earnings?.available || 0) * 0.75).toFixed(2))}
              >
                75%
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setWithdrawAmount((earnings?.available || 0).toFixed(2))}
              >
                Max
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
