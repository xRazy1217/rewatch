'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isInitialized } = useAuthStore()

  useEffect(() => {
    // Redirect to feed if already authenticated
    if (isInitialized && user) {
      router.replace('/feed')
    }
  }, [isInitialized, user, router])

  // Show nothing while checking authentication
  if (!isInitialized) {
    return null
  }

  // Show nothing if authenticated (redirect is happening)
  if (user) {
    return null
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #FDFAF7 0%, #FFF8F5 50%, #F0EBFF40 100%)' }}
    >
      {children}
    </div>
  )
}
