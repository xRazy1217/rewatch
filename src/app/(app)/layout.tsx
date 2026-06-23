import { ProtectedLayout } from './ProtectedLayout'
import { AppShell } from './AppShell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout>
      <AppShell>{children}</AppShell>
    </ProtectedLayout>
  )
}
