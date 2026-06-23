import { AuthLayout } from './AuthLayoutWrapper'

export default function AuthLayoutComponent({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>
}
