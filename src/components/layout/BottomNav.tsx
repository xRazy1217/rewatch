'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Compass, Plus, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/feed',     icon: Home,    label: 'inicio' },
  { href: '/discover', icon: Compass, label: 'descubrir' },
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
              <Link key={item.href} href={item.href} className="flex flex-col items-center -mt-5">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
                    boxShadow: '0 4px 20px rgba(244,167,185,0.45)',
                  }}
                >
                  <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
                </motion.div>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (isActive) {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
              className="flex flex-col items-center gap-1 px-3 py-1 min-w-[44px]"
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="relative flex items-center justify-center"
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-all duration-200',
                    isActive
                      ? 'text-rose'
                      : 'text-text-muted'
                  )}
                  style={{ color: isActive ? '#F4A7B9' : '#B8A8B0' }}
                  strokeWidth={isActive ? 2 : 1.5}
                />

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      key="dot"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -bottom-1.5 w-1 h-1 rounded-full"
                      style={{ backgroundColor: '#F4A7B9' }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>

              <span
                className={cn(
                  'text-[10px] font-accent font-medium transition-all duration-200',
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
