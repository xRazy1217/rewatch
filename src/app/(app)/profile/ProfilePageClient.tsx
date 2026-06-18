'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, LogOut, Grid3X3, Bookmark, FolderHeart, Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { PageTransition } from '@/components/layout/PageTransition'
import { FeedCard } from '@/features/feed/components/FeedCard'
import { FeedCardSkeleton } from '@/features/feed/components/FeedCardSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { MoodTag } from '@/components/shared/MoodTag'
import { EditProfileSheet } from '@/features/profile/components/EditProfileSheet'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useProfileRecommendations } from '@/features/profile/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'
import type { Collection, MoodTag as MoodTagType } from '@/types'

type Tab = 'posts' | 'guardado' | 'colecciones'

function useUserCollections(userId: string) {
  return useQuery({
    queryKey: ['collections', userId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await (supabase as any)
        .from('collections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return ((data ?? []) as Array<{
        id: string
        user_id: string
        name: string
        description: string | null
        cover_url: string | null
        mood_tag: string | null
        item_count: number | null
        is_public: boolean | null
        created_at: string | null
      }>).map((col): Collection => ({
        id: col.id,
        userId: col.user_id,
        name: col.name,
        description: col.description ?? null,
        coverUrl: col.cover_url ?? null,
        moodTag: (col.mood_tag as MoodTagType) ?? null,
        itemCount: col.item_count ?? 0,
        isPublic: col.is_public ?? true,
        createdAt: col.created_at ?? '',
      }))
    },
    enabled: !!userId,
  })
}

export function ProfilePageClient() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('posts')
  const [showEditProfile, setShowEditProfile] = useState(false)

  const { data: recs, isLoading: recsLoading } = useProfileRecommendations(user?.id ?? '')
  const { data: collections, isLoading: colsLoading } = useUserCollections(user?.id ?? '')

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

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'posts', label: 'posts', icon: <Grid3X3 style={{ width: 14, height: 14 }} /> },
    { id: 'guardado', label: 'guardado', icon: <Bookmark style={{ width: 14, height: 14 }} /> },
    { id: 'colecciones', label: 'colecciones', icon: <FolderHeart style={{ width: 14, height: 14 }} /> },
  ]

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
            onClick={() => setShowEditProfile(true)}
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

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderTop: '1px solid rgba(201,184,232,0.2)',
            borderBottom: '1px solid rgba(201,184,232,0.2)',
          }}
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '12px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                position: 'relative',
                color: activeTab === tab.id ? '#2D2426' : '#B8A8B0',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                fontWeight: activeTab === tab.id ? 600 : 400,
              }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-indicator"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '20%',
                    right: '20%',
                    height: 2,
                    borderRadius: 1,
                    background: 'linear-gradient(90deg, #F4A7B9, #C9B8E8)',
                  }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ paddingTop: 16 }}
          >
            {/* Posts tab */}
            {activeTab === 'posts' && (
              <>
                {recsLoading ? (
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
              </>
            )}

            {/* Guardado tab */}
            {activeTab === 'guardado' && (
              <div className="flex flex-col items-center gap-4 px-4 py-8">
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: '#7A6B72', textAlign: 'center' }}>
                  ver todas tus recomendaciones guardadas
                </p>
                <Link
                  href="/saved"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 24px',
                    borderRadius: 20,
                    background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
                    color: '#2D2426',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <Bookmark style={{ width: 16, height: 16 }} />
                  ir a guardados
                </Link>
              </div>
            )}

            {/* Colecciones tab */}
            {activeTab === 'colecciones' && (
              <div className="px-4">
                {/* Create button */}
                <Link
                  href="/collections/new"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 16px',
                    marginBottom: 16,
                    borderRadius: 16,
                    border: '1.5px dashed rgba(201,184,232,0.5)',
                    background: 'rgba(201,184,232,0.06)',
                    color: '#7A5C8A',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  <Plus style={{ width: 16, height: 16 }} />
                  crear colección
                </Link>

                {colsLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="shimmer" style={{ height: 72, borderRadius: 16 }} />
                    ))}
                  </div>
                ) : !collections || collections.length === 0 ? (
                  <EmptyState
                    illustration="collections"
                    headline="aún no tenés colecciones"
                    subtext="crea una para organizar lo que más te gusta"
                    className="mt-4"
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {collections.map((col) => (
                      <motion.div key={col.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          href={`/collections/${col.id}`}
                          style={{ textDecoration: 'none', display: 'block' }}
                        >
                          <div style={{
                            padding: '14px 16px',
                            borderRadius: 16,
                            background: '#FFF8F5',
                            boxShadow: '0 2px 12px rgba(45,36,38,0.05)',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                              <h3 style={{
                                fontFamily: "'DM Serif Display', serif",
                                fontSize: 15,
                                fontWeight: 400,
                                color: '#2D2426',
                              }}>
                                {col.name}
                              </h3>
                              <span style={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: 11,
                                color: '#B8A8B0',
                              }}>
                                {col.itemCount} items
                              </span>
                            </div>
                            {col.moodTag && (
                              <MoodTag tag={col.moodTag as MoodTagType} size="sm" />
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Edit profile sheet */}
      <EditProfileSheet
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        currentProfile={{
          display_name: profile.display_name,
          username: profile.username,
          bio: profile.bio,
        }}
      />
    </PageTransition>
  )
}
