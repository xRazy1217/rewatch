'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart, MessageCircle, Bookmark, UserPlus } from 'lucide-react'
import Image from 'next/image'
import { PageTransition } from '@/components/layout/PageTransition'
import { EmptyState } from '@/components/shared/EmptyState'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

interface NotificationRow {
  id: string
  type: 'like' | 'comment' | 'follow' | 'save'
  read: boolean | null
  created_at: string | null
  recommendation_id: string | null
  actor: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
  }
}

const TYPE_CONFIG = {
  like:    { icon: Heart,      label: 'le dio like a tu recomendación',  color: '#F4A7B9' },
  comment: { icon: MessageCircle, label: 'comentó tu recomendación',     color: '#C9B8E8' },
  save:    { icon: Bookmark,   label: 'guardó tu recomendación',         color: '#B8D8C9' },
  follow:  { icon: UserPlus,   label: 'empezó a seguirte',              color: '#F9CDB5' },
}

export function ActivityPageClient() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return []
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('notifications')
        .select(`*, actor:profiles!notifications_actor_id_fkey(id, username, display_name, avatar_url)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      return (data ?? []) as NotificationRow[]
    },
    enabled: !!user,
  })

  const markRead = useMutation({
    mutationFn: async () => {
      if (!user) return
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const unreadCount = notifications?.filter(n => !n.read).length ?? 0

  return (
    <PageTransition>
      <header
        className="sticky top-0 z-40 glass border-b px-5 py-4 flex items-center justify-between"
        style={{ borderColor: 'rgba(201,184,232,0.2)' }}
      >
        <div className="flex items-center gap-2">
          <h1
            className="text-2xl"
            style={{ fontFamily: "'DM Serif Display', serif", color: '#2D2426', fontWeight: 400 }}
          >
            actividad
          </h1>
          {unreadCount > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: '#F4A7B9', color: '#FDFAF7', fontFamily: "'DM Sans', sans-serif" }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markRead.mutate()}
            className="text-xs font-medium"
            style={{ color: '#F4A7B9', fontFamily: "'DM Sans', sans-serif" }}
          >
            marcar todo leído
          </button>
        )}
      </header>

      <div className="pb-4">
        {isLoading ? (
          <div className="flex flex-col gap-2 px-4 pt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: '#FFF8F5' }}>
                <div className="w-10 h-10 rounded-full shimmer flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-3/4 rounded-full shimmer" />
                  <div className="h-2.5 w-1/3 rounded-full shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <EmptyState
            illustration="activity"
            headline="nada nuevo por ahora"
            subtext="cuando alguien reaccione a tus posts lo verás aquí"
            className="mt-16"
          />
        ) : (
          <div className="flex flex-col pt-2">
            {notifications.map((notif) => {
              const config = TYPE_CONFIG[notif.type]
              const Icon = config.icon
              const avatarFallback = notif.actor.display_name
                .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

              return (
                <div
                  key={notif.id}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors"
                  style={{
                    background: notif.read ? 'transparent' : 'rgba(244,167,185,0.06)',
                    borderBottom: '1px solid rgba(201,184,232,0.15)',
                  }}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      {notif.actor.avatar_url ? (
                        <Image src={notif.actor.avatar_url} alt={notif.actor.display_name} width={40} height={40} className="object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-xs font-semibold"
                          style={{ background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)', color: '#FDFAF7' }}
                        >
                          {avatarFallback}
                        </div>
                      )}
                    </div>
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: config.color }}
                    >
                      <Icon className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: '#2D2426', fontFamily: "'Inter', sans-serif" }}>
                      <span className="font-semibold">@{notif.actor.username}</span>
                      {' '}{config.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#B8A8B0', fontFamily: "'DM Sans', sans-serif" }}>
                      {notif.created_at ? formatRelativeTime(notif.created_at) : ''}
                    </p>
                  </div>

                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#F4A7B9' }} />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
