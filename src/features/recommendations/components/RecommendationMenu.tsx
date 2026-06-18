'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

interface RecommendationMenuProps {
  recommendationId: string
  userId: string
  onDeleted?: () => void
}

export function RecommendationMenu({
  recommendationId,
  userId,
  onDeleted,
}: RecommendationMenuProps) {
  const { user } = useAuthStore()
  const { addToast } = useUIStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Only show for the owner
  if (!user || user.id !== userId) {
    return (
      <button
        className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-black/5"
        aria-label="más opciones"
        disabled
        style={{ opacity: 0, pointerEvents: 'none' }}
      >
        <MoreHorizontal className="w-4 h-4" style={{ color: '#B8A8B0' }} />
      </button>
    )
  }

  // Close on outside click
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
        setConfirmDelete(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await (supabase as any)
        .from('recommendations')
        .delete()
        .eq('id', recommendationId)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['profile-recs'] })
      addToast('recomendación eliminada', 'success')
      onDeleted?.()
      setOpen(false)
    } catch {
      addToast('error al eliminar', 'error')
    } finally {
      setDeleting(false)
    }
  }

  function handleEdit() {
    router.push(`/create?edit=${recommendationId}`)
    addToast('próximamente ✨', 'info')
    setOpen(false)
  }

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setOpen((v) => !v)
          setConfirmDelete(false)
        }}
        className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-black/5"
        aria-label="más opciones"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreHorizontal className="w-4 h-4" style={{ color: '#B8A8B0' }} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              zIndex: 50,
              background: '#FFFFFF',
              borderRadius: 16,
              boxShadow: '0 8px 32px rgba(45,36,38,0.14)',
              minWidth: 160,
              overflow: 'hidden',
              border: '1px solid rgba(201,184,232,0.25)',
            }}
          >
            {/* Edit */}
            <motion.button
              role="menuitem"
              onClick={handleEdit}
              whileHover={{ background: 'rgba(201,184,232,0.10)' }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: '#2D2426',
                textAlign: 'left',
              }}
            >
              <Pencil style={{ width: 14, height: 14, color: '#7A6B72' }} />
              editar
            </motion.button>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(201,184,232,0.2)', margin: '0 12px' }} />

            {/* Delete */}
            <motion.button
              role="menuitem"
              onClick={handleDelete}
              disabled={deleting}
              whileHover={{ background: 'rgba(244,167,185,0.08)' }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                cursor: deleting ? 'default' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: confirmDelete ? '#E8849A' : '#2D2426',
                textAlign: 'left',
              }}
            >
              <Trash2 style={{ width: 14, height: 14, color: confirmDelete ? '#E8849A' : '#7A6B72' }} />
              {deleting ? 'eliminando...' : confirmDelete ? '¿confirmar?' : 'eliminar'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
