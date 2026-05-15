'use client'

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityData {
  id: string
  message: string
  projectId: string
  userId: string | null
  user: { id: string; name: string; email: string } | null
  createdAt: string
}

export function ActivityFeed({ projectId }: { projectId: string }) {
  const token = useAuthStore((s) => s.token)
  const [activities, setActivities] = useState<ActivityData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadActivities = useCallback(async () => {
    if (!token || !projectId) return
    try {
      api.setToken(token)
      const data = await api.getActivities(projectId)
      setActivities(data.activities || [])
    } catch (err) {
      console.error('Failed to load activities:', err)
    } finally {
      setIsLoading(false)
    }
  }, [token, projectId])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-semibold text-sm">Activity Feed</h3>
        </div>
      </div>
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-2">
                <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No activity yet</p>
          </div>
        ) : (
          <div className="p-2">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">
                  {activity.user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{activity.message}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
