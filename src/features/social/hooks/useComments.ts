'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface CommentRow {
  id: string
  recommendation_id: string
  user_id: string
  content: string
  created_at: string | null
  user: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
  }
}

export function useComments(recommendationId: string) {
  return useQuery({
    queryKey: ['comments', recommendationId],
    queryFn: async () => {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('comments')
        .select('*, user:profiles!comments_user_id_fkey(id, username, display_name, avatar_url)')
        .eq('recommendation_id', recommendationId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as CommentRow[]
    },
    enabled: !!recommendationId,
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      recommendationId,
      content,
      userId,
    }: {
      recommendationId: string
      content: string
      userId: string
    }) => {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('comments')
        .insert({
          recommendation_id: recommendationId,
          content,
          user_id: userId,
        })
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      // Invalidate only the specific comment thread, not the entire feed
      queryClient.invalidateQueries({ queryKey: ['comments', variables.recommendationId] })
      // Optimistic update: update comment count in feed instead of refetching
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
                    commentsCount: item.commentsCount + 1,
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
