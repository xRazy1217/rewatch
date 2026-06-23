'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'

// Pure store accessor — NO listeners here (AuthProvider handles all auth events)
export function useAuth() {
  const { user, profile, clear } = useAuthStore()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    clear()
    router.replace('/login')
  }

  return { user, profile, signOut }
}
