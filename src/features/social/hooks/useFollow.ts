'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'

export function useFollow(targetUserId: string) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const currentUserId = user?.id

  const { data: isFollowing, isLoading } = useQuery({
    queryKey: ['follows', targetUserId, currentUserId],
    queryFn: async () => {
      if (!currentUserId || !targetUserId) return false
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .maybeSingle()
      return !!data
    },
    enabled: !!currentUserId && !!targetUserId,
  })

  const follow = useMutation({
    mutationFn: async () => {
      if (!currentUserId) throw new Error('not authenticated')
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any
      await db.from('follows').insert({
        follower_id: currentUserId,
        following_id: targetUserId,
      })
      // Create notification
      await db.from('notifications').insert({
        user_id: targetUserId,
        type: 'follow',
        actor_id: currentUserId,
        recommendation_id: null,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follows', targetUserId] })
      queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] })
    },
  })

  const unfollow = useMutation({
    mutationFn: async () => {
      if (!currentUserId) throw new Error('not authenticated')
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follows', targetUserId] })
      queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] })
    },
  })

  return { isFollowing: isFollowing ?? false, isLoading, follow, unfollow, currentUserId }
}
