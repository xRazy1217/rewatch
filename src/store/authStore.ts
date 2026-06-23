import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  followers_count: number | null
  following_count: number | null
}

interface AuthState {
  user: User | null
  profile: Profile | null
  isInitialized: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setInitialized: (v: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isInitialized: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setInitialized: (v) => set({ isInitialized: v }),
  clear: () => set({ user: null, profile: null, isInitialized: false }),
}))
