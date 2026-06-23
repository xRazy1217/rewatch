'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isInitialized } = useAuthStore()

  useEffect(() => {
    // Redirect to login if not authenticated after initialization is complete
    if (isInitialized && !user) {
      router.replace('/login')
    }
  }, [isInitialized, user, router])

  // Show nothing while checking authentication
  if (!isInitialized) {
    return null
  }

  // Show nothing if not authenticated (redirect is happening)
  if (!user) {
    return null
  }

  return <>{children}</>
}
