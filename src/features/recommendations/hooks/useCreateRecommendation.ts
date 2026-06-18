'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { MediaType, MoodTag } from '@/types'

export interface CreateRecommendationInput {
  type: MediaType
  title: string
  subtitle: string | null
  description: string | null
  coverUrl: string
  rating: number
  moodTags: MoodTag[]
  source: 'manual' | 'spotify' | 'tmdb' | 'google_books'
  externalId: string | null
  externalMetadata: Record<string, unknown>
}

export function useCreateRecommendation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateRecommendationInput) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('not authenticated')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any
      const { data, error } = await db.from('recommendations').insert({
        user_id: user.id,
        type: input.type,
        title: input.title,
        subtitle: input.subtitle,
        description: input.description,
        cover_url: input.coverUrl,
        rating: input.rating,
        mood_tags: input.moodTags,
        source: input.source,
        external_id: input.externalId,
        external_metadata: input.externalMetadata,
        is_public: true,
      }).select().single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['profile-recs'] })
    },
  })
}
