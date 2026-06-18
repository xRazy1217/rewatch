'use client'

import { useRef, useCallback } from 'react'
import { PageTransition } from '@/components/layout/PageTransition'
import { FeedList } from '@/features/feed/components/FeedList'
import { FeedCardSkeleton } from '@/features/feed/components/FeedCardSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { useFeed } from '@/features/feed/hooks/useFeed'

export function FeedPageClient() {
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed()

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
        className="sticky top-0 z-40 glass border-b px-5 py-4"
        style={{ borderColor: 'rgba(201,184,232,0.2)' }}
      >
        <div className="flex items-center justify-between">
          <h1
            className="text-2xl"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: '#2D2426', fontWeight: 400 }}
          >
            rewatch
          </h1>
          <div
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{
              background: 'linear-gradient(135deg, #FDE8EE 0%, #F0EBFF 100%)',
              color: '#7A6B72',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            siguiendo
          </div>
        </div>
      </header>

      <div className="pt-4 pb-4">
        {isLoading ? (
          <div className="flex flex-col gap-4 px-4">
            {Array.from({ length: 3 }).map((_, i) => <FeedCardSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '64px 32px',
              gap: 16,
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '2.5rem' }}>🌧️</span>
            <p
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '1.2rem',
                color: '#2D2426',
                fontWeight: 400,
              }}
            >
              algo salió mal
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.85rem',
                color: '#7A6B72',
              }}
            >
              no pudimos cargar tu feed
            </p>
            <button
              onClick={() => refetch()}
              style={{
                padding: '10px 24px',
                borderRadius: 20,
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
                color: '#2D2426',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.85rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(244,167,185,0.3)',
              }}
            >
              intentar de nuevo
            </button>
          </div>
        ) : allRecs.length === 0 ? (
          <EmptyState
            illustration="feed"
            headline="tu feed está esperando algo bonito"
            subtext="sigue a personas para ver sus recomendaciones aquí"
            action={{ label: 'explorar', href: '/discover' }}
            className="mt-12"
          />
        ) : (
          <FeedList
            recommendations={allRecs}
            lastCardRef={lastCardRef}
          />
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
