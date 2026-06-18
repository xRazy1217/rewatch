export function FeedCardSkeleton() {
  return (
    <div
      className="rounded-[20px] overflow-hidden"
      style={{ background: '#FFF8F5', boxShadow: '0 2px 16px rgba(45,36,38,0.06)' }}
      aria-hidden="true"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <div className="w-9 h-9 rounded-full shimmer flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-24 rounded-full shimmer" />
          <div className="h-2.5 w-16 rounded-full shimmer" />
        </div>
      </div>

      {/* Review snippet */}
      <div className="px-4 pb-3 space-y-1.5">
        <div className="h-3 w-full rounded-full shimmer" />
        <div className="h-3 w-3/4 rounded-full shimmer" />
      </div>

      {/* Media card */}
      <div className="px-4 pb-3">
        <div
          className="flex gap-3 p-3 rounded-2xl"
          style={{ background: '#FFFFFF' }}
        >
          <div className="w-20 h-20 rounded-xl shimmer flex-shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3.5 w-full rounded-full shimmer" />
            <div className="h-3 w-2/3 rounded-full shimmer" />
            <div className="h-3 w-20 rounded-full shimmer" />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="px-4 pb-3 flex gap-1.5">
        <div className="h-5 w-20 rounded-full shimmer" />
        <div className="h-5 w-24 rounded-full shimmer" />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(201,184,232,0.2)' }}>
        <div className="flex gap-4">
          <div className="h-4 w-12 rounded-full shimmer" />
          <div className="h-4 w-10 rounded-full shimmer" />
        </div>
        <div className="h-5 w-5 rounded shimmer" />
      </div>
    </div>
  )
}
