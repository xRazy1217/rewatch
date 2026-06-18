'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useSave() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      recommendationId,
      saved,
    }: {
      recommendationId: string
      saved: boolean
    }) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('not authenticated')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any

      if (saved) {
        await db.from('saved_items').insert({
          recommendation_id: recommendationId,
          user_id: user.id,
        })
      } else {
        await db.from('saved_items').delete()
          .eq('recommendation_id', recommendationId)
          .eq('user_id', user.id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}
