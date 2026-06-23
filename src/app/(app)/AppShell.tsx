'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { BottomNav } from '@/components/layout/BottomNav'
import { ToastContainer } from '@/components/shared/ToastContainer'

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isInitialized } = useAuthStore()

  useEffect(() => {
    // Only redirect after auth has fully initialized
    if (isInitialized && !user) {
      router.replace('/login')
    }
  }, [isInitialized, user, router])

  // Show content immediately — no loading gate
  // AuthProvider in providers.tsx handles the single source of truth
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
