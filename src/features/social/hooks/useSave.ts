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
    onSuccess: (_data, variables) => {
      // Optimistic update: update the feed cache directly instead of refetching
      queryClient.setQueriesData(
        { queryKey: ['feed'] },
        (oldData: any) => {
          if (!oldData?.pages) return oldData
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) =>
              page.map((item: any) => {
                if (item.id === variables.recommendationId) {
                  return {
                    ...item,
                    savesCount: variables.saved ? item.savesCount + 1 : item.savesCount - 1,
                  }
                }
                return item
              })
            ),
          }
        }
      )
    },
  })
}
