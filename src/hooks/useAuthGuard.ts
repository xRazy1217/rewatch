'use client'

import { useAuthStore } from '@/store/authStore'

export function useAuthGuard() {
  const { user, profile, isInitialized } = useAuthStore()

  return { user, profile, checked: isInitialized }
}
