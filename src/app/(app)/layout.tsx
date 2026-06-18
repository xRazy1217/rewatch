import { BottomNav } from '@/components/layout/BottomNav'
import { ToastContainer } from '@/components/shared/ToastContainer'

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
