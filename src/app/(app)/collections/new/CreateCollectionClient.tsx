'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { MoodTag } from '@/components/shared/MoodTag'
import { type MoodTag as MoodTagType, MOOD_TAG_CONFIG } from '@/types'

const ALL_MOOD_TAGS = Object.keys(MOOD_TAG_CONFIG) as MoodTagType[]

export function CreateCollectionClient() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { addToast } = useUIStore()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [moodTag, setMoodTag] = useState<MoodTagType | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !name.trim()) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await (supabase as any).from('collections').insert({
        user_id: user.id,
        name: name.trim(),
        description: description.trim() || null,
        mood_tag: moodTag,
        is_public: true,
      })
      if (error) throw error
      addToast('colección creada ✨', 'success')
      router.push('/profile')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'error al crear', 'error')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 12,
    border: '1.5px solid rgba(201,184,232,0.4)',
    background: '#FDFAF7',
    fontFamily: "'Inter', sans-serif",
    fontSize: 15,
    color: '#2D2426',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ minHeight: '100vh', background: '#FDFAF7' }}
    >
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(253,250,247,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(201,184,232,0.2)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(45,36,38,0.06)',
            border: 'none', cursor: 'pointer',
          }}
          aria-label="volver"
        >
          <ArrowLeft style={{ width: 16, height: 16, color: '#2D2426' }} />
        </motion.button>
        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '1.3rem',
          fontWeight: 400,
          color: '#2D2426',
        }}>
          nueva colección
        </h1>
      </header>

      <form onSubmit={handleSubmit} style={{ padding: '24px 20px 100px' }}>
        {/* Name */}
        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: 'block',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: '#7A6B72',
            marginBottom: 6,
            fontWeight: 500,
          }}>
            nombre *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="mi colección de otoño..."
            required
            maxLength={80}
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: 'block',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: '#7A6B72',
            marginBottom: 6,
            fontWeight: 500,
          }}>
            descripción (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="cuéntanos sobre esta colección..."
            maxLength={200}
            rows={3}
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
          />
        </div>

        {/* Mood tag */}
        <div style={{ marginBottom: 32 }}>
          <label style={{
            display: 'block',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: '#7A6B72',
            marginBottom: 10,
            fontWeight: 500,
          }}>
            mood (opcional)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ALL_MOOD_TAGS.map((tag) => (
              <MoodTag
                key={tag}
                tag={tag}
                selected={moodTag === tag}
                onToggle={(t) => setMoodTag(moodTag === t ? null : t)}
                size="md"
              />
            ))}
          </div>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={!name.trim() || saving}
          whileTap={!name.trim() || saving ? {} : { scale: 0.97 }}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 16,
            border: 'none',
            background: name.trim() && !saving
              ? 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)'
              : 'rgba(201,184,232,0.3)',
            color: name.trim() && !saving ? '#2D2426' : '#B8A8B0',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            fontWeight: 600,
            cursor: name.trim() && !saving ? 'pointer' : 'default',
            transition: 'background 0.2s',
          }}
        >
          {saving ? 'creando...' : 'crear colección'}
        </motion.button>
      </form>
    </motion.div>
  )
}
