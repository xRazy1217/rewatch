import { cn } from '@/lib/utils'

interface EmptyStateProps {
  illustration?: 'feed' | 'saves' | 'collections' | 'activity' | 'discover'
  headline: string
  subtext?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

const ILLUSTRATIONS: Record<string, React.ReactNode> = {
  feed: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="50" fill="#FDE8EE" />
      <circle cx="60" cy="60" r="35" fill="#FFF8F5" />
      {/* Stars */}
      <path d="M60 35 L63 47 L75 47 L65 55 L68 67 L60 59 L52 67 L55 55 L45 47 L57 47 Z"
        fill="#F4A7B9" opacity="0.8" />
      {/* Flowers */}
      <circle cx="35" cy="78" r="4" fill="#C9B8E8" opacity="0.6" />
      <circle cx="85" cy="78" r="4" fill="#C9B8E8" opacity="0.6" />
      <circle cx="35" cy="70" r="3" fill="#F4A7B9" opacity="0.5" />
      <circle cx="85" cy="70" r="3" fill="#F4A7B9" opacity="0.5" />
      {/* Petals */}
      <circle cx="60" cy="84" r="5" fill="#F9CDB5" opacity="0.7" />
      <circle cx="50" cy="82" r="3" fill="#B8D8C9" opacity="0.6" />
      <circle cx="70" cy="82" r="3" fill="#B8D8C9" opacity="0.6" />
    </svg>
  ),
  saves: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="50" fill="#F0EBFF" />
      <circle cx="60" cy="60" r="35" fill="#FFF8F5" />
      {/* Bookmark */}
      <path d="M48 40 L72 40 L72 78 L60 68 L48 78 Z" fill="#C9B8E8" opacity="0.7" />
      <path d="M53 50 L67 50" stroke="#F4A7B9" strokeWidth="2" strokeLinecap="round" />
      <path d="M53 56 L67 56" stroke="#F4A7B9" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  collections: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="50" fill="#FDE8EE" />
      {/* Cards stacked */}
      <rect x="38" y="50" width="44" height="32" rx="8" fill="#C9B8E8" opacity="0.5" />
      <rect x="34" y="46" width="44" height="32" rx="8" fill="#F4A7B9" opacity="0.6" />
      <rect x="30" y="42" width="44" height="32" rx="8" fill="#FFF8F5" stroke="#F4A7B9" strokeWidth="1.5" />
      <circle cx="52" cy="58" r="6" fill="#FDE8EE" />
      <path d="M42 68 L58 68" stroke="#C9B8E8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  activity: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="50" fill="#F0EBFF" />
      <circle cx="60" cy="60" r="35" fill="#FFF8F5" />
      {/* Bell */}
      <path d="M60 35 C52 35 45 42 45 52 L45 65 L38 72 L82 72 L75 65 L75 52 C75 42 68 35 60 35 Z"
        fill="#C9B8E8" opacity="0.6" />
      <path d="M56 72 C56 74.2 57.8 76 60 76 C62.2 76 64 74.2 64 72" fill="#F4A7B9" opacity="0.8" />
      {/* Sparkles */}
      <circle cx="80" cy="38" r="3" fill="#F4A7B9" opacity="0.7" />
      <circle cx="38" cy="42" r="2" fill="#F9CDB5" opacity="0.7" />
    </svg>
  ),
  discover: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="50" fill="#FFF3E8" />
      <circle cx="60" cy="60" r="35" fill="#FFF8F5" />
      {/* Compass */}
      <circle cx="60" cy="60" r="18" stroke="#C9B8E8" strokeWidth="2" fill="none" />
      <path d="M60 46 L64 58 L60 60 Z" fill="#F4A7B9" />
      <path d="M60 74 L56 62 L60 60 Z" fill="#C9B8E8" opacity="0.6" />
      <circle cx="60" cy="60" r="2" fill="#2D2426" />
    </svg>
  ),
}

export function EmptyState({
  illustration = 'feed',
  headline,
  subtext,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-8 py-12 gap-4',
        className
      )}
    >
      <div className="animate-float">
        {ILLUSTRATIONS[illustration]}
      </div>

      <div className="space-y-1.5 max-w-xs">
        <p
          className="text-base font-medium"
          style={{ color: '#2D2426', fontFamily: "'Inter', sans-serif" }}
        >
          {headline}
        </p>
        {subtext && (
          <p
            className="text-sm"
            style={{ color: '#7A6B72', fontFamily: "'Inter', sans-serif" }}
          >
            {subtext}
          </p>
        )}
      </div>

      {action && (
        <a
          href={action.href}
          onClick={action.onClick}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
            color: '#2D2426',
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 4px 16px rgba(244,167,185,0.3)',
          }}
        >
          {action.label}
        </a>
      )}
    </div>
  )
}
