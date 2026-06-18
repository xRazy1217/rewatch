'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

const TYPE_STYLES: Record<'success' | 'error' | 'info', { background: string; color: string }> = {
  success: { background: '#B8D8C9', color: '#2D5A3A' },
  error: { background: '#F4A7B9', color: '#2D2426' },
  info: { background: '#C9B8E8', color: '#2D2426' },
}

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore()

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 100,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        zIndex: 100,
        pointerEvents: 'none',
        padding: '0 20px',
      }}
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const styles = TYPE_STYLES[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 18px 10px 16px',
                borderRadius: 24,
                background: styles.background,
                color: styles.color,
                boxShadow: '0 4px 20px rgba(45,36,38,0.14)',
                pointerEvents: 'auto',
                maxWidth: 340,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
              role="alert"
            >
              <span style={{ flex: 1 }}>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  opacity: 0.7,
                }}
                aria-label="cerrar"
              >
                <X style={{ width: 14, height: 14, color: styles.color }} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
