'use client'

import { motion } from 'framer-motion'
import { useFollow } from '@/features/social/hooks/useFollow'

interface FollowButtonProps {
  targetUserId: string
  className?: string
}

export function FollowButton({ targetUserId, className }: FollowButtonProps) {
  const { isFollowing, isLoading, follow, unfollow, currentUserId } = useFollow(targetUserId)

  // Don't render if same user or loading initial state
  if (!currentUserId || currentUserId === targetUserId) return null

  function handleClick() {
    if (isFollowing) {
      unfollow.mutate()
    } else {
      follow.mutate()
    }
  }

  const isPending = follow.isPending || unfollow.isPending

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={handleClick}
      disabled={isPending || isLoading}
      className={className}
      style={{
        padding: '8px 20px',
        borderRadius: 20,
        border: 'none',
        cursor: isPending || isLoading ? 'default' : 'pointer',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.85rem',
        fontWeight: 600,
        transition: 'opacity 0.2s',
        opacity: isPending || isLoading ? 0.6 : 1,
        ...(isFollowing
          ? {
              background: '#C9B8E8',
              color: '#2D2426',
            }
          : {
              background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
              color: '#2D2426',
              boxShadow: '0 4px 12px rgba(244,167,185,0.3)',
            }),
      }}
      aria-label={isFollowing ? 'dejar de seguir' : 'seguir'}
    >
      {isFollowing ? 'siguiendo' : 'seguir'}
    </motion.button>
  )
}
