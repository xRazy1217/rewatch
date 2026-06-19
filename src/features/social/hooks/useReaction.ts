'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'

export function useReaction(recommendationId: string) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: reaction } = useQuery({
    queryKey: ['reaction', recommendationId, user?.id],
    queryFn: async () => {
      if (!user) return null
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('reactions')
        .select('*')
        .eq('recommendation_id', recommendationId)
        .eq('user_id', user.id)
        .maybeSingle()
      return data as { id: string; rating: number } | null
    },
    enabled: !!user && !!recommendationId,
  })

  const { data: allReactions } = useQuery({
    queryKey: ['reactions-all', recommendationId],
    queryFn: async () => {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('reactions')
        .select('*, user:profiles!reactions_user_id_fkey(id, username, display_name, avatar_url)')
        .eq('recommendation_id', recommendationId)
      return (data ?? []) as Array<{
        id: string
        rating: number
        user: { id: string; username: string; display_name: string; avatar_url: string | null }
      }>
    },
    enabled: !!recommendationId,
  })

  const upsertReaction = useMutation({
    mutationFn: async (rating: number) => {
      if (!user) throw new Error('not authenticated')
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('reactions').upsert({
        user_id: user.id,
        recommendation_id: recommendationId,
        rating,
      }, { onConflict: 'user_id,recommendation_id' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reaction', recommendationId] })
      queryClient.invalidateQueries({ queryKey: ['reactions-all', recommendationId] })
    },
  })

  const removeReaction = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('not authenticated')
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('reactions')
        .delete()
        .eq('user_id', user.id)
        .eq('recommendation_id', recommendationId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reaction', recommendationId] })
      queryClient.invalidateQueries({ queryKey: ['reactions-all', recommendationId] })
    },
  })

  return { reaction, allReactions: allReactions ?? [], upsertReaction, removeReaction }
}
