'use client'

import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

// Single auth listener — initialized once for the entire app lifetime
function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setInitialized, clear } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    async function fetchProfile(userId: string) {
      try {
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
        )

        // Race between the actual fetch and the timeout
        const fetchPromise = (async () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase as any)
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

          if (error) throw error
          return data
        })()

        const data = await Promise.race([fetchPromise, timeoutPromise])
        if (data) setProfile(data)
      } catch (err) {
        console.warn('Profile fetch failed (continuing anyway):', err instanceof Error ? err.message : String(err))
        // Continue even if profile fetch fails - don't block initialization
      }
    }

    // Use onAuthStateChange ONLY — it fires INITIAL_SESSION on mount
    // which handles both fresh sessions and token refreshes correctly
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (event === 'SIGNED_OUT' || !session?.user) {
            clear()
            setInitialized(true)
            return
          }

          setUser(session.user)
          await fetchProfile(session.user.id)
          setInitialized(true)
        } catch (err) {
          console.error('Auth state change error:', err)
          setInitialized(true)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}
