'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ExternalLink } from 'lucide-react'
import { useMediaSearch, type MediaSearchResult } from '../hooks/useMediaSearch'
import type { MediaType } from '@/types'
import { MEDIA_TYPE_CONFIG } from '@/types'

interface MediaSearchInputProps {
  mediaType: MediaType
  onSelect: (result: MediaSearchResult) => void
  selected: MediaSearchResult | null
  onClear: () => void
}

export function MediaSearchInput({ mediaType, onSelect, selected, onClear }: MediaSearchInputProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)

  const { data: results, isLoading } = useMediaSearch(query, mediaType)
  const config = MEDIA_TYPE_CONFIG[mediaType]

  const showResults = focused && query.trim().length >= 2

  if (selected) {
    return (
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          display: 'flex',
          gap: 12,
          padding: 12,
          borderRadius: 16,
          background: '#FFFFFF',
          border: '1.5px solid rgba(244,167,185,0.4)',
          boxShadow: '0 2px 12px rgba(244,167,185,0.12)',
          alignItems: 'center',
        }}
      >
        {/* Cover */}
        <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#FDE8EE', position: 'relative' }}>
          {selected.image ? (
            <Image src={selected.image} alt={selected.title} fill sizes="56px" style={{ objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', background: 'linear-gradient(135deg, #FDE8EE 0%, #F0EBFF 100%)' }}>
              {config.emoji}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', fontWeight: 600, color: '#2D2426', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selected.title}
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#7A6B72', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selected.subtitle}
          </p>
        </div>

        {/* Clear */}
        <button onClick={onClear} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(45,36,38,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <X style={{ width: 14, height: 14, color: '#7A6B72' }} />
        </button>
      </motion.div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        borderRadius: 16,
        background: '#FFF8F5',
        border: `1.5px solid ${focused ? '#F4A7B9' : 'rgba(201,184,232,0.4)'}`,
        transition: 'border-color 0.2s',
        boxShadow: focused ? '0 0 0 3px rgba(244,167,185,0.15)' : 'none',
      }}>
        <Search style={{ width: 16, height: 16, color: '#B8A8B0', flexShrink: 0 }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={`buscar ${config.label.toLowerCase()}...`}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.9rem',
            color: '#2D2426',
          }}
          autoComplete="off"
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <X style={{ width: 14, height: 14, color: '#B8A8B0' }} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 50,
              background: '#FFFFFF',
              borderRadius: 16,
              boxShadow: '0 8px 32px rgba(45,36,38,0.12)',
              border: '1.5px solid rgba(201,184,232,0.25)',
              overflow: 'hidden',
              maxHeight: 320,
              overflowY: 'auto',
            }}
          >
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', alignItems: 'center' }}>
                    <div className="shimmer" style={{ width: 44, height: 44, borderRadius: 8, flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div className="shimmer" style={{ height: 11, width: '60%', borderRadius: 6 }} />
                      <div className="shimmer" style={{ height: 10, width: '40%', borderRadius: 6 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : !results || results.length === 0 ? (
              <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#B8A8B0' }}>
                  sin resultados para &ldquo;{query}&rdquo;
                </p>
              </div>
            ) : (
              results.map((result, i) => (
                <motion.button
                  key={result.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => { onSelect(result); setQuery('') }}
                  style={{
                    display: 'flex',
                    gap: 10,
                    padding: '10px 14px',
                    alignItems: 'center',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderBottom: i < results.length - 1 ? '1px solid rgba(201,184,232,0.15)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FFF8F5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  {/* Image */}
                  <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#FDE8EE', position: 'relative' }}>
                    {result.image ? (
                      <Image src={result.image} alt={result.title} fill sizes="44px" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', background: 'linear-gradient(135deg, #FDE8EE 0%, #F0EBFF 100%)' }}>
                        {config.emoji}
                      </div>
                    )}
                  </div>
                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#2D2426', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {result.title}
                    </p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: '#7A6B72', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {result.subtitle}
                    </p>
                  </div>
                  {/* External link hint */}
                  {result.externalUrl && (
                    <ExternalLink style={{ width: 12, height: 12, color: '#B8A8B0', flexShrink: 0 }} />
                  )}
                </motion.button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
