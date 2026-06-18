'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send } from 'lucide-react'
import { useComments, useAddComment } from '@/features/social/hooks/useComments'
import { useAuthStore } from '@/store/authStore'
import { formatRelativeTime } from '@/lib/utils'

interface CommentSheetProps {
  recommendationId: string
  isOpen: boolean
  onClose: () => void
}

export function CommentSheet({ recommendationId, isOpen, onClose }: CommentSheetProps) {
  const { user } = useAuthStore()
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: comments, isLoading } = useComments(isOpen ? recommendationId : '')
  const addComment = useAddComment()

  // Focus input when sheet opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 400)
    }
  }, [isOpen])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !user) return
    addComment.mutate(
      { recommendationId, content: text.trim(), userId: user.id },
      { onSuccess: () => setText('') }
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Scrim */}
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(45,36,38,0.4)',
              zIndex: 60,
            }}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 61,
              background: '#FFF8F5',
              borderRadius: '24px 24px 0 0',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 20px 14px',
                borderBottom: '1px solid rgba(201,184,232,0.2)',
                flexShrink: 0,
              }}
            >
              {/* Drag handle */}
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  background: 'rgba(45,36,38,0.12)',
                }}
              />
              <h2
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: '1.2rem',
                  color: '#2D2426',
                  fontWeight: 400,
                }}
              >
                comentarios
              </h2>
              <button
                onClick={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(45,36,38,0.06)',
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label="cerrar"
              >
                <X style={{ width: 16, height: 16, color: '#7A6B72' }} />
              </button>
            </div>

            {/* Comments list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
              {isLoading ? (
                // Skeleton rows
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 20px' }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div
                        className="shimmer"
                        style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div className="shimmer" style={{ height: 12, width: '40%', borderRadius: 6 }} />
                        <div className="shimmer" style={{ height: 12, width: '70%', borderRadius: 6 }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !comments || comments.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '48px 20px',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>🌸</span>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.9rem',
                      color: '#7A6B72',
                      textAlign: 'center',
                    }}
                  >
                    sé la primera en comentar 🌸
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {comments.map((comment) => {
                    const avatarFallback = comment.user.display_name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()

                    return (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          display: 'flex',
                          gap: 10,
                          padding: '8px 20px',
                          alignItems: 'flex-start',
                        }}
                      >
                        {/* Avatar */}
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            flexShrink: 0,
                            position: 'relative',
                          }}
                        >
                          {comment.user.avatar_url ? (
                            <Image
                              src={comment.user.avatar_url}
                              alt={comment.user.display_name}
                              fill
                              sizes="34px"
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
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                color: '#FDFAF7',
                              }}
                            >
                              {avatarFallback}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <span
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: '#2D2426',
                              }}
                            >
                              @{comment.user.username}
                            </span>
                            <span
                              style={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: '0.7rem',
                                color: '#B8A8B0',
                              }}
                            >
                              {comment.created_at ? formatRelativeTime(comment.created_at) : ''}
                            </span>
                          </div>
                          <p
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: '0.85rem',
                              color: '#2D2426',
                              marginTop: 2,
                              lineHeight: 1.4,
                            }}
                          >
                            {comment.content}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Bottom input */}
            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                padding: '12px 16px',
                paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
                borderTop: '1px solid rgba(201,184,232,0.2)',
                background: '#FFF8F5',
                flexShrink: 0,
              }}
            >
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="escribe un comentario..."
                disabled={!user}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 20,
                  border: '1.5px solid rgba(201,184,232,0.4)',
                  background: '#FDFAF7',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.9rem',
                  color: '#2D2426',
                  outline: 'none',
                }}
              />
              <motion.button
                type="submit"
                whileTap={{ scale: 0.9 }}
                disabled={!text.trim() || !user || addComment.isPending}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: !text.trim() || !user
                    ? 'rgba(201,184,232,0.3)'
                    : 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
                  border: 'none',
                  cursor: !text.trim() || !user ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.2s',
                }}
                aria-label="enviar comentario"
              >
                <Send style={{ width: 16, height: 16, color: '#FDFAF7' }} />
              </motion.button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
