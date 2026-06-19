'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { BottomNav } from '@/components/layout/BottomNav'
import { ToastContainer } from '@/components/shared/ToastContainer'

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { setUser, setProfile, user } = useAuthStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const supabase = createClient()

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.replace('/login')
        return
      }

      setUser(session.user)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('profiles').select('*').eq('id', session.user.id).single()
      if (data) setProfile(data)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/login')
        return
      }
      setUser(session.user)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('profiles').select('*').eq('id', session.user.id).single()
      if (data) setProfile(data)
    })

    return () => subscription.unsubscribe()
  }, [router, setUser, setProfile])

  return (
    <div className="relative min-h-screen" style={{ background: '#FDFAF7' }}>
      <main className="pb-24 pt-safe">
        {children}
      </main>
      <BottomNav />
      <ToastContainer />
    </div>
  )
}
