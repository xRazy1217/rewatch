import { cn } from '@/lib/utils'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

/** Lightweight CSS fade — avoids framer-motion cost on every tab switch */
export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <div className={cn('page-enter', className)}>
      {children}
    </div>
  )
}
