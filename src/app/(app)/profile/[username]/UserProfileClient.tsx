'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Grid3X3 } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { FeedCard } from '@/features/feed/components/FeedCard'
import { FeedCardSkeleton } from '@/features/feed/components/FeedCardSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { FollowButton } from '@/features/social/components/FollowButton'
import { useProfileRecommendations } from '@/features/profile/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'

interface ProfileData {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  followers_count: number | null
  following_count: number | null
}

interface UserProfileClientProps {
  username: string
}

export function UserProfileClient({ username }: UserProfileClientProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setProfile(data as ProfileData)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [username])

  const { data: recs, isLoading: recsLoading } = useProfileRecommendations(profile?.id ?? '')

  if (loading) {
    return (
      <PageTransition>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div
            className="shimmer"
            style={{ width: 40, height: 40, borderRadius: '50%' }}
          />
        </div>
      </PageTransition>
    )
  }

  if (notFound || !profile) {
    return (
      <PageTransition>
        <header
          className="sticky top-0 z-40 glass border-b"
          style={{ borderColor: 'rgba(201,184,232,0.2)', padding: '16px 20px' }}
        >
          <button
            onClick={() => router.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#2D2426',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
            aria-label="volver"
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
            volver
          </button>
        </header>
        <EmptyState
          illustration="discover"
          headline="usuario no encontrado"
          subtext="no existe ningún usuario con ese nombre"
          className="mt-16"
        />
      </PageTransition>
    )
  }

  const avatarFallback = profile.display_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <PageTransition>
      {/* Header */}
      <header
        className="sticky top-0 z-40 glass border-b"
        style={{
          borderColor: 'rgba(201,184,232,0.2)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#2D2426',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
          aria-label="volver"
        >
          <ArrowLeft style={{ width: 18, height: 18 }} />
        </button>
        <h2
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '1rem',
            fontWeight: 600,
            color: '#2D2426',
          }}
        >
          @{profile.username}
        </h2>
        <div style={{ width: 24 }} />
      </header>

      <div className="pb-4">
        {/* Profile hero */}
        <div style={{ padding: '24px 20px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name}
                fill
                sizes="80px"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 600,
                  color: '#FDFAF7',
                }}
              >
                {avatarFallback}
              </div>
            )}
          </motion.div>

          <div>
            <h1
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '1.3rem',
                color: '#2D2426',
                fontWeight: 400,
                margin: 0,
              }}
            >
              {profile.display_name}
            </h1>
            {profile.bio && (
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.85rem',
                  color: '#7A6B72',
                  marginTop: 4,
                  maxWidth: 260,
                }}
              >
                {profile.bio}
              </p>
            )}
          </div>

          {/* Follow button */}
          <FollowButton targetUserId={profile.id} />

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginTop: 4 }}>
            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#2D2426',
                  margin: 0,
                }}
              >
                {recs?.length ?? 0}
              </p>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.7rem',
                  color: '#B8A8B0',
                  margin: 0,
                }}
              >
                posts
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#2D2426',
                  margin: 0,
                }}
              >
                {profile.followers_count ?? 0}
              </p>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.7rem',
                  color: '#B8A8B0',
                  margin: 0,
                }}
              >
                seguidores
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#2D2426',
                  margin: 0,
                }}
              >
                {profile.following_count ?? 0}
              </p>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.7rem',
                  color: '#B8A8B0',
                  margin: 0,
                }}
              >
                siguiendo
              </p>
            </div>
          </div>
        </div>

        {/* Divider + section label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '16px 20px 12px',
            borderTop: '1px solid rgba(201,184,232,0.2)',
          }}
        >
          <Grid3X3 style={{ width: 16, height: 16, color: '#F4A7B9' }} />
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#2D2426',
            }}
          >
            recomendaciones
          </span>
        </div>

        {/* Recs */}
        {recsLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 16px' }}>
            {[0, 1].map((i) => <FeedCardSkeleton key={i} />)}
          </div>
        ) : !recs || recs.length === 0 ? (
          <EmptyState
            illustration="feed"
            headline="aún no hay recomendaciones"
            subtext="este usuario no ha compartido nada todavía"
            className="mt-8"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 16px' }}>
            {recs.map((rec) => (
              <FeedCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
