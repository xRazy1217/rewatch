'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, ExternalLink } from 'lucide-react'
import { StarRating } from '@/components/shared/StarRating'
import { MoodTagList } from '@/components/shared/MoodTag'
import { MediaTypeBadge } from '@/components/shared/MediaTypeBadge'
import { MediaSearchInput } from './MediaSearchInput'
import { useCreateRecommendation } from '../hooks/useCreateRecommendation'
import { useUIStore } from '@/store/uiStore'
import type { MediaType, MoodTag } from '@/types'
import { MEDIA_TYPE_CONFIG } from '@/types'
import type { MediaSearchResult } from '../hooks/useMediaSearch'

const ALL_MOOD_TAGS = [
  'cozy', 'rainy night', 'crying', 'comfort',
  'late night drive', 'study vibes', 'soft girl', 'healing',
  'nostalgic', 'hype', 'heartbreak', 'summer',
  'winter feels', 'romantic', 'dark academia',
] as MoodTag[]

const MEDIA_TYPES: MediaType[] = ['movie', 'series', 'book', 'song', 'album']

export function CreateRecommendation() {
  const router = useRouter()
  const { addToast } = useUIStore()
  const { mutateAsync, isPending } = useCreateRecommendation()

  const [step, setStep] = useState<'type' | 'details' | 'mood'>('type')
  const [type, setType] = useState<MediaType>('movie')
  const [selectedMedia, setSelectedMedia] = useState<MediaSearchResult | null>(null)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [rating, setRating] = useState(0)
  const [moodTags, setMoodTags] = useState<MoodTag[]>([])
  const [success, setSuccess] = useState(false)

  function handleSelectMedia(result: MediaSearchResult) {
    setSelectedMedia(result)
    setTitle(result.title)
    setSubtitle(result.subtitle)
  }

  function handleClearMedia() {
    setSelectedMedia(null)
    setTitle('')
    setSubtitle('')
  }

  function toggleMood(tag: MoodTag) {
    setMoodTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag].slice(0, 4)
    )
  }

  async function handleSubmit() {
    if (!title.trim() || rating === 0) return
    try {
      await mutateAsync({
        type,
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        description: description.trim() || null,
        coverUrl: selectedMedia?.image ?? '',
        rating,
        moodTags,
        source: selectedMedia
          ? (type === 'song' || type === 'album' ? 'spotify' : type === 'book' ? 'google_books' : 'tmdb')
          : 'manual',
        externalId: selectedMedia?.id ?? null,
        externalMetadata: selectedMedia?.extraMetadata ?? {},
      })
      setSuccess(true)
      addToast('listo, lo compartiste ✨', 'success')
      setTimeout(() => router.push('/feed'), 1200)
    } catch {
      addToast('algo salió mal, intenta de nuevo', 'error')
    }
  }

  const canNextDetails = title.trim().length >= 1 && rating > 0
  const progressWidth = step === 'type' ? '33%' : step === 'details' ? '66%' : '100%'

  if (success) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
          style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Check style={{ width: 28, height: 28, color: 'white' }} />
        </motion.div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.1rem', fontWeight: 600, color: '#2D2426' }}>
          listo, lo compartiste
        </p>
      </motion.div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FDFAF7' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 glass border-b"
        style={{ borderColor: 'rgba(201,184,232,0.2)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <button
          onClick={() => step === 'type' ? router.back() : setStep(step === 'mood' ? 'details' : 'type')}
          style={{ width: 36, height: 36, borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft style={{ width: 20, height: 20, color: '#7A6B72' }} />
        </button>
        <h1 style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: '1rem', fontWeight: 600, color: '#2D2426' }}>
          {step === 'type' ? '¿qué quieres compartir?' : step === 'details' ? 'cuéntanos más' : 'el vibe'}
        </h1>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {(['type', 'details', 'mood'] as const).map(s => (
            <div key={s} style={{ height: 6, borderRadius: 3, transition: 'all 0.3s', width: step === s ? 16 : 6, background: step === s ? '#F4A7B9' : 'rgba(201,184,232,0.4)' }} />
          ))}
        </div>
      </header>

      {/* Progress bar */}
      <div style={{ height: 2, background: 'rgba(201,184,232,0.2)' }}>
        <motion.div animate={{ width: progressWidth }} transition={{ duration: 0.4 }} style={{ height: '100%', background: 'linear-gradient(90deg, #F4A7B9, #C9B8E8)' }} />
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Type */}
        {step === 'type' && (
          <motion.div key="type" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }}
            style={{ padding: '24px 16px 96px', display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            {MEDIA_TYPES.map(t => {
              const config = MEDIA_TYPE_CONFIG[t]
              const isSelected = type === t
              return (
                <motion.button key={t} whileTap={{ scale: 0.97 }}
                  onClick={() => { setType(t); setSelectedMedia(null); setTitle(''); setSubtitle(''); setStep('details') }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                    borderRadius: 20, textAlign: 'left', border: 'none', cursor: 'pointer',
                    background: isSelected ? '#FDE8EE' : '#FFF8F5',
                    outline: `1.5px solid ${isSelected ? '#F4A7B9' : 'rgba(201,184,232,0.3)'}`,
                    boxShadow: isSelected ? '0 2px 12px rgba(244,167,185,0.2)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '1.8rem' }}>{config.emoji}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.95rem', fontWeight: 600, color: '#2D2426', flex: 1 }}>{config.label}</span>
                  {isSelected && (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#F4A7B9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check style={{ width: 11, height: 11, color: 'white' }} />
                    </div>
                  )}
                </motion.button>
              )
            })}
          </motion.div>
        )}

        {/* STEP 2: Details */}
        {step === 'details' && (
          <motion.div key="details" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }}
            style={{ padding: '20px 16px 96px', display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <MediaTypeBadge type={type} size="md" />

            {/* Search */}
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 500, color: '#7A6B72', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                buscar
              </p>
              <MediaSearchInput
                mediaType={type}
                onSelect={handleSelectMedia}
                selected={selectedMedia}
                onClear={handleClearMedia}
              />
            </div>

            {/* External link if selected */}
            {selectedMedia?.externalUrl && (
              <a href={selectedMedia.externalUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#F4A7B9', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}>
                <ExternalLink style={{ width: 12, height: 12 }} />
                {type === 'song' || type === 'album' ? 'ver en Spotify' : type === 'book' ? 'ver en Open Library' : 'ver en TMDB'}
              </a>
            )}

            {/* Manual title fallback */}
            {!selectedMedia && (
              <div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 500, color: '#7A6B72', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  o escribe manualmente
                </p>
                <input
                  type="text"
                  placeholder="título"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 16, border: '1.5px solid rgba(201,184,232,0.3)', background: '#FFF8F5', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#2D2426', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {/* Review */}
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 500, color: '#7A6B72', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                reseña (opcional)
              </p>
              <textarea
                placeholder="¿qué sentiste? ¿a quién se la recomendarías?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={300}
                rows={3}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 16, border: '1.5px solid rgba(201,184,232,0.3)', background: '#FFF8F5', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#2D2426', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
              />
              <p style={{ textAlign: 'right', fontSize: '0.72rem', color: '#B8A8B0', fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{description.length}/300</p>
            </div>

            {/* Rating */}
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 500, color: '#7A6B72', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                rating
              </p>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep('mood')} disabled={!canNextDetails}
              style={{
                width: '100%', padding: '14px', borderRadius: 20, border: 'none', cursor: canNextDetails ? 'pointer' : 'default',
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', fontWeight: 600,
                background: canNextDetails ? 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)' : 'rgba(201,184,232,0.3)',
                color: canNextDetails ? '#2D2426' : '#B8A8B0',
                boxShadow: canNextDetails ? '0 4px 16px rgba(244,167,185,0.35)' : 'none',
              }}>
              continuar
            </motion.button>
          </motion.div>
        )}

        {/* STEP 3: Mood */}
        {step === 'mood' && (
          <motion.div key="mood" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }}
            style={{ padding: '20px 16px 96px', display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#7A6B72' }}>
              ¿qué tags describen cómo se siente? (hasta 4)
            </p>

            <MoodTagList tags={ALL_MOOD_TAGS} selectedTags={moodTags} onToggle={toggleMood} />

            {/* Preview */}
            <div style={{ padding: 16, borderRadius: 20, background: '#FFF8F5', border: '1.5px solid rgba(201,184,232,0.2)', display: 'flex', gap: 12, alignItems: 'center' }}>
              {/* Cover preview */}
              <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', flexShrink: 0, position: 'relative', background: 'linear-gradient(135deg, #FDE8EE 0%, #F0EBFF 100%)' }}>
                {selectedMedia?.image ? (
                  <Image src={selectedMedia.image} alt={title} fill sizes="52px" style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                    {MEDIA_TYPE_CONFIG[type].emoji}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <MediaTypeBadge type={type} size="sm" />
                  <StarRating value={rating} readonly size="sm" />
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#2D2426', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
                {subtitle && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: '#7A6B72', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</p>}
              </div>
            </div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={isPending}
              style={{
                width: '100%', padding: '14px', borderRadius: 20, border: 'none', cursor: isPending ? 'default' : 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', fontWeight: 600,
                background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
                color: '#2D2426', boxShadow: '0 4px 16px rgba(244,167,185,0.35)',
                opacity: isPending ? 0.7 : 1,
              }}>
              {isPending ? 'compartiendo...' : 'compartir ✨'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
