import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X, Loader2, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { adminApi, authApi } from '@/services/api'
import { socketService } from '@/services/socket'

export default function UserApprovalTab() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Join admin room and listen for real-time updates
  useEffect(() => {
    socketService.joinAdminRoom()

    socketService.onNewUserRegistration((user) => {
      toast({ title: 'New User Registration', description: `${user.name} (${user.role}) is pending approval.` })
      queryClient.invalidateQueries({ queryKey: ['pending-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    })

    socketService.onUserApproved((user) => {
      toast({ title: 'User Approved', description: `${user.name} has been approved.` })
      queryClient.invalidateQueries({ queryKey: ['pending-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    })

    socketService.onUserRejected((user) => {
      toast({ title: 'User Rejected', description: `${user.name} has been rejected.` })
      queryClient.invalidateQueries({ queryKey: ['pending-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    })

    return () => {
      socketService.leaveAdminRoom()
      socketService.removeEventListeners('admin:user:registered')
      socketService.removeEventListeners('admin:user:approved')
      socketService.removeEventListeners('admin:user:rejected')
    }
  }, [])

  const { data: pendingUsers, isLoading: loadingPending } = useQuery({
    queryKey: ['pending-users'],
    queryFn: () => adminApi.getPendingUsers(),
  })

  const { data: allUsers, isLoading: loadingAll } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => authApi.getAllUsers(),
  })

  const approveMutation = useMutation({
    mutationFn: (userId: string) => adminApi.approveUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast({ title: 'User approved', description: 'User can now login.' })
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (userId: string) => adminApi.rejectUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast({ title: 'User rejected', description: 'User has been removed.' })
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message })
    },
  })

  const pending = pendingUsers?.data || []
  const users = allUsers?.data || []
  const farmersCount = users.filter((u: any) => u.role === 'farmer' && u.approval_status === 'approved').length
  const buyersCount = users.filter((u: any) => u.role === 'buyer' && u.approval_status === 'approved').length

  if (loadingPending || loadingAll) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-100">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold">{pending.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved Farmers</p>
                <p className="text-2xl font-bold">{farmersCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved Buyers</p>
                <p className="text-2xl font-bold">{buyersCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Users */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Users ({pending.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No pending users</p>
          ) : (
            <div className="divide-y">
              {pending.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">{user.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.role === 'farmer' ? 'default' : 'secondary'}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => approveMutation.mutate(user.id)}
                      disabled={approveMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(user.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
