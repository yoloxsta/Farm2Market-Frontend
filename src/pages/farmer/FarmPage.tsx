import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Calendar, Leaf, Plus, Edit } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { farmerApi } from '@/services/api'
import { formatDate } from '@/lib/utils'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import type { HarvestSchedule } from '@/types'

const harvestStatusColors: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-800',
  planted: 'bg-blue-100 text-blue-800',
  growing: 'bg-green-100 text-green-800',
  ready: 'bg-yellow-100 text-yellow-800',
  harvested: 'bg-purple-100 text-purple-800',
}

export default function FarmPage() {
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [, setSelectedSchedule] = useState<HarvestSchedule | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['farmer-profile'],
    queryFn: () => farmerApi.getProfile(),
  })

  const { data: schedulesData, isLoading: schedulesLoading } = useQuery({
    queryKey: ['harvest-schedules'],
    queryFn: () => farmerApi.getHarvestSchedules(),
  })

  const createScheduleMutation = useMutation({
    mutationFn: (data: Partial<HarvestSchedule>) =>
      farmerApi.createHarvestSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['harvest-schedules'] })
      toast({
        title: 'Schedule created',
        description: 'Your harvest schedule has been added.',
      })
      setScheduleDialogOpen(false)
    },
  })

  if (profileLoading || schedulesLoading) {
    return <PageLoader />
  }

  const profile = profileData?.data
  const schedules = schedulesData?.data || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Farm Management</h1>
        <p className="text-muted-foreground">
          Manage your farm profile and harvest schedules
        </p>
      </div>

      {/* Farm Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Farm Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Farm Name</Label>
                <p className="text-lg font-semibold">{profile?.farmName}</p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="font-medium">{profile?.farmLocation}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Farm Size</Label>
                <p className="font-medium">{profile?.farmSize} acres</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm">{profile?.farmDescription}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Certifications</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile?.certifications?.map((cert) => (
                    <Badge key={cert} variant="secondary">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="flex justify-end">
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Harvest Schedules */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Harvest Schedules</CardTitle>
          <Button onClick={() => { setSelectedSchedule(null); setScheduleDialogOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Schedule
          </Button>
        </CardHeader>
        <CardContent>
          {schedules.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="rounded-lg border p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">{schedule.cropName}</p>
                        <p className="text-sm text-muted-foreground">
                          {schedule.fieldLocation}
                        </p>
                      </div>
                    </div>
                    <Badge className={harvestStatusColors[schedule.status]}>
                      {schedule.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Planted</p>
                      <p className="font-medium">{formatDate(schedule.plantingDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expected Harvest</p>
                      <p className="font-medium">{formatDate(schedule.expectedHarvestDate)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Estimated Yield</p>
                      <p className="font-medium">
                        {schedule.estimatedYield} {schedule.unit}
                      </p>
                    </div>
                  </div>
                  
                  {schedule.notes && (
                    <p className="text-sm text-muted-foreground">
                      {schedule.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No harvest schedules yet</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setScheduleDialogOpen(true)}
              >
                Add your first schedule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Harvest Schedule</DialogTitle>
          </DialogHeader>
          
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              createScheduleMutation.mutate({
                cropName: formData.get('cropName') as string,
                fieldLocation: formData.get('fieldLocation') as string,
                plantingDate: formData.get('plantingDate') as string,
                expectedHarvestDate: formData.get('expectedHarvestDate') as string,
                estimatedYield: parseFloat(formData.get('estimatedYield') as string),
                unit: formData.get('unit') as any,
                notes: formData.get('notes') as string,
              })
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="cropName">Crop Name</Label>
              <Input
                id="cropName"
                name="cropName"
                placeholder="e.g., Organic Tomatoes"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldLocation">Field Location</Label>
              <Input
                id="fieldLocation"
                name="fieldLocation"
                placeholder="e.g., Field A - North Section"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plantingDate">Planting Date</Label>
                <Input
                  id="plantingDate"
                  name="plantingDate"
                  type="date"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedHarvestDate">Expected Harvest</Label>
                <Input
                  id="expectedHarvestDate"
                  name="expectedHarvestDate"
                  type="date"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedYield">Estimated Yield</Label>
                <Input
                  id="estimatedYield"
                  name="estimatedYield"
                  type="number"
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select name="unit" defaultValue="kg">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="lb">Pound (lb)</SelectItem>
                    <SelectItem value="ton">Ton</SelectItem>
                    <SelectItem value="crate">Crate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Additional notes..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setScheduleDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createScheduleMutation.isPending}
              >
                {createScheduleMutation.isPending ? 'Creating...' : 'Create Schedule'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
