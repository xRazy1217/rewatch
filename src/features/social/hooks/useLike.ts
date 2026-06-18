'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useLike() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      recommendationId,
      liked,
    }: {
      recommendationId: string
      liked: boolean
    }) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('not authenticated')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any

      if (liked) {
        await db.from('likes').insert({
          recommendation_id: recommendationId,
          user_id: user.id,
        })

        // Fetch recommendation to get its owner
        const { data: rec } = await db
          .from('recommendations')
          .select('user_id')
          .eq('id', recommendationId)
          .single()

        // Notify owner (if not self-like)
        if (rec && rec.user_id && rec.user_id !== user.id) {
          await db.from('notifications').insert({
            user_id: rec.user_id,
            type: 'like',
            actor_id: user.id,
            recommendation_id: recommendationId,
          })
        }
      } else {
        await db.from('likes').delete()
          .eq('recommendation_id', recommendationId)
          .eq('user_id', user.id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}
