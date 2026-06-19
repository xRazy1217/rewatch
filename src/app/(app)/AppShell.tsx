'use client'

import { useAuthGuard } from '@/hooks/useAuthGuard'
import { BottomNav } from '@/components/layout/BottomNav'
import { ToastContainer } from '@/components/shared/ToastContainer'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { checked } = useAuthGuard()

  if (!checked) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FDFAF7',
        }}
      >
        {/* Soft loading indicator */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.85); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen" style={{ background: '#FDFAF7' }}>
      <main className="pb-24 pt-safe">
        {children}
      </main>
      <BottomNav />
      <ToastContainer />
    </div>
  )
}
