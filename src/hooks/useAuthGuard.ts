'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'

export function useAuthGuard() {
  const router = useRouter()
  const { user, profile, setUser, setProfile } = useAuthStore()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.replace('/login')
        return
      }

      setUser(session.user)

      if (!profile) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (data) setProfile(data)
      }

      setChecked(true)
    })
  }, [router, setUser, setProfile, profile])

  return { user, profile, checked }
}
