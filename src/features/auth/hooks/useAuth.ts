'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { user, profile, setUser, setProfile, clear } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) fetchProfile(user.id)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          clear()
        }
      }
    )

    async function fetchProfile(userId: string) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (data) setProfile(data)
    }

    return () => subscription.unsubscribe()
  }, [setUser, setProfile, clear])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    clear()
  }

  return { user, profile, signOut }
}
