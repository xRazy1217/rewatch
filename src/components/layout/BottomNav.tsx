'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, Bell, User, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/feed',     icon: Home,    label: 'inicio' },
  { href: '/saved',    icon: Bookmark, label: 'guardado' },
  { href: '/create',   icon: Plus,    label: 'crear',   isCreate: true },
  { href: '/activity', icon: Bell,    label: 'actividad' },
  { href: '/profile',  icon: User,    label: 'perfil' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass border-t"
      style={{ borderColor: 'rgba(201,184,232,0.25)' }}
    >
      <div className="flex items-center justify-around px-2 pb-safe pt-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          if (item.isCreate) {
            return (
              <Link key={item.href} href={item.href} prefetch className="flex flex-col items-center -mt-5">
                <div
                  className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg active:scale-95 transition-transform duration-150"
                  style={{
                    background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
                    boxShadow: '0 4px 20px rgba(244,167,185,0.45)',
                  }}
                >
                  <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onClick={() => {
                if (isActive) {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
              className="flex flex-col items-center gap-1 px-3 py-1 min-w-[44px]"
            >
              <div className="relative flex items-center justify-center active:scale-90 transition-transform duration-150">
                <Icon
                  className={cn(
                    'w-6 h-6 transition-colors duration-150',
                    isActive ? 'text-rose' : 'text-text-muted'
                  )}
                  style={{ color: isActive ? '#F4A7B9' : '#B8A8B0' }}
                  strokeWidth={isActive ? 2 : 1.5}
                />

                {isActive && (
                  <div
                    className="absolute -bottom-1.5 w-1 h-1 rounded-full animate-scale-in"
                    style={{ backgroundColor: '#F4A7B9' }}
                  />
                )}
              </div>

              <span
                className={cn(
                  'text-[10px] font-accent font-medium transition-opacity duration-150',
                  isActive ? 'opacity-100' : 'opacity-0'
                )}
                style={{ color: '#F4A7B9', fontFamily: "'DM Sans', sans-serif" }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
