'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Settings, LogOut, Grid3X3 } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { FeedCard } from '@/features/feed/components/FeedCard'
import { FeedCardSkeleton } from '@/features/feed/components/FeedCardSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useProfileRecommendations } from '@/features/profile/hooks/useProfile'

export function ProfilePageClient() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()

  const { data: recs, isLoading } = useProfileRecommendations(user?.id ?? '')

  if (!user || !profile) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 rounded-full shimmer" />
        </div>
      </PageTransition>
    )
  }

  const avatarFallback = profile.display_name
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <PageTransition>
      {/* Header */}
      <header
        className="sticky top-0 z-40 glass border-b px-5 py-4 flex items-center justify-between"
        style={{ borderColor: 'rgba(201,184,232,0.2)' }}
      >
        <h2
          className="text-lg font-semibold"
          style={{ color: '#2D2426', fontFamily: "'Inter', sans-serif" }}
        >
          @{profile.username}
        </h2>
        <div className="flex items-center gap-2">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-black/5"
            aria-label="configuración"
          >
            <Settings className="w-5 h-5" style={{ color: '#B8A8B0' }} />
          </button>
          <button
            onClick={handleSignOut}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-black/5"
            aria-label="cerrar sesión"
          >
            <LogOut className="w-5 h-5" style={{ color: '#B8A8B0' }} />
          </button>
        </div>
      </header>

      <div className="pb-4">
        {/* Profile hero */}
        <div className="px-5 pt-6 pb-5 text-center space-y-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-20 h-20 rounded-full mx-auto overflow-hidden"
          >
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.display_name} fill className="object-cover" sizes="80px" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xl font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
                  color: '#FDFAF7',
                }}
              >
                {avatarFallback}
              </div>
            )}
          </motion.div>

          <div>
            <h1
              className="text-xl"
              style={{ fontFamily: "'DM Serif Display', serif", color: '#2D2426', fontWeight: 400 }}
            >
              {profile.display_name}
            </h1>
            {profile.bio && (
              <p className="text-sm mt-1 max-w-xs mx-auto" style={{ color: '#7A6B72', fontFamily: "'Inter', sans-serif" }}>
                {profile.bio}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-lg font-semibold" style={{ color: '#2D2426', fontFamily: "'Inter', sans-serif" }}>
                {recs?.length ?? 0}
              </p>
              <p className="text-xs" style={{ color: '#B8A8B0', fontFamily: "'DM Sans', sans-serif" }}>
                posts
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold" style={{ color: '#2D2426', fontFamily: "'Inter', sans-serif" }}>
                {profile.followers_count ?? 0}
              </p>
              <p className="text-xs" style={{ color: '#B8A8B0', fontFamily: "'DM Sans', sans-serif" }}>
                seguidores
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold" style={{ color: '#2D2426', fontFamily: "'Inter', sans-serif" }}>
                {profile.following_count ?? 0}
              </p>
              <p className="text-xs" style={{ color: '#B8A8B0', fontFamily: "'DM Sans', sans-serif" }}>
                siguiendo
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          className="flex items-center gap-2 px-5 pb-4"
          style={{ borderTop: '1px solid rgba(201,184,232,0.2)' }}
        >
          <div className="flex items-center gap-1.5 pt-4">
            <Grid3X3 className="w-4 h-4" style={{ color: '#F4A7B9' }} />
            <span className="text-sm font-medium" style={{ color: '#2D2426', fontFamily: "'DM Sans', sans-serif" }}>
              recomendaciones
            </span>
          </div>
        </div>

        {/* Recs */}
        {isLoading ? (
          <div className="flex flex-col gap-4 px-4">
            {Array.from({ length: 2 }).map((_, i) => <FeedCardSkeleton key={i} />)}
          </div>
        ) : !recs || recs.length === 0 ? (
          <EmptyState
            illustration="feed"
            headline="aún no compartiste nada"
            subtext="tus recomendaciones aparecerán aquí"
            action={{ label: 'compartir algo', href: '/create' }}
            className="mt-8"
          />
        ) : (
          <div className="flex flex-col gap-4 px-4">
            {recs.map((rec) => (
              <FeedCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
