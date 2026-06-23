'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeFeed() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to real-time changes on the recommendations table
    const channel = supabase
      .channel('public:recommendations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'recommendations',
          filter: 'is_public=eq.true',
        },
        () => {
          // When a new recommendation is added, invalidate the feed cache
          // This will trigger a refetch of the first page
          queryClient.invalidateQueries({ queryKey: ['feed'] })
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [queryClient])
}
