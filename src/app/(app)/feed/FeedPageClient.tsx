'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import { FeedList } from '@/features/feed/components/FeedList'
import { FeedCardSkeleton } from '@/features/feed/components/FeedCardSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { useFeed } from '@/features/feed/hooks/useFeed'
import type { MediaType } from '@/types'

const FILTERS: { label: string; value: MediaType | 'all'; emoji: string }[] = [
  { label: 'todo', value: 'all', emoji: '✨' },
  { label: 'películas', value: 'movie', emoji: '🎬' },
  { label: 'series', value: 'series', emoji: '📺' },
  { label: 'canciones', value: 'song', emoji: '🎵' },
  { label: 'álbumes', value: 'album', emoji: '💿' },
  { label: 'libros', value: 'book', emoji: '📖' },
]

export function FeedPageClient() {
  const [activeFilter, setActiveFilter] = useState<MediaType | 'all'>('all')
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useFeed(activeFilter)

  const observer = useRef<IntersectionObserver | null>(null)
  const lastCardRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage()
      })
      if (node) observer.current.observe(node)
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  )

  const allRecs = data?.pages.flat() ?? []

  return (
    <PageTransition>
      {/* Header */}
      <header
        className="sticky top-0 z-40 glass border-b"
        style={{ borderColor: 'rgba(201,184,232,0.2)' }}
      >
        <div style={{ padding: '16px 20px 0' }}>
          <h1
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: '1.6rem', color: '#2D2426', fontWeight: 400, marginBottom: 12,
            }}
          >
            rewatch
          </h1>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none' }}>
            {FILTERS.map(f => {
              const isActive = activeFilter === f.value
              return (
                <motion.button
                  key={f.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(f.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 14px', borderRadius: 20, border: 'none',
                    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 600,
                    background: isActive ? 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)' : '#FFF8F5',
                    color: isActive ? '#2D2426' : '#7A6B72',
                    boxShadow: isActive ? '0 2px 10px rgba(244,167,185,0.3)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>{f.emoji}</span>
                  <span>{f.label}</span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="pt-4 pb-4">
        {isLoading ? (
          <div className="flex flex-col gap-4 px-4">
            {Array.from({ length: 3 }).map((_, i) => <FeedCardSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center mt-16 gap-3">
            <span style={{ fontSize: '2rem' }}>🌧️</span>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#7A6B72' }}>
              algo salió mal
            </p>
            <button
              onClick={() => refetch()}
              style={{
                padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#2D2426',
              }}
            >
              reintentar
            </button>
          </div>
        ) : allRecs.length === 0 ? (
          <EmptyState
            illustration="feed"
            headline={activeFilter === 'all' ? 'el muro está esperando algo bonito' : `nadie ha compartido ${FILTERS.find(f => f.value === activeFilter)?.label} todavía`}
            subtext="sé la primera en compartir algo"
            action={{ label: 'compartir algo', href: '/create' }}
            className="mt-12"
          />
        ) : (
          <FeedList recommendations={allRecs} lastCardRef={lastCardRef} />
        )}

        {isFetchingNextPage && (
          <div className="flex flex-col gap-4 px-4 mt-4">
            <FeedCardSkeleton />
          </div>
        )}
      </div>
    </PageTransition>
  )
}
