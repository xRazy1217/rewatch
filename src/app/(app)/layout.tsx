import { BottomNav } from '@/components/layout/BottomNav'
import { ToastContainer } from '@/components/shared/ToastContainer'
import { AppShell } from './AppShell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {children}
    </AppShell>
  )
}
