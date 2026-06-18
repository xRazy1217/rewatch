'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AtSign, Check, Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

interface EditProfileSheetProps {
  isOpen: boolean
  onClose: () => void
  currentProfile: {
    display_name: string
    username: string
    bio: string | null
  }
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function EditProfileSheet({
  isOpen,
  onClose,
  currentProfile,
}: EditProfileSheetProps) {
  const { addToast } = useUIStore()
  const { setProfile } = useAuthStore()
  const queryClient = useQueryClient()

  const [displayName, setDisplayName] = useState(currentProfile.display_name)
  const [username, setUsername] = useState(currentProfile.username)
  const [bio, setBio] = useState(currentProfile.bio ?? '')
  const [saving, setSaving] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)

  const debouncedUsername = useDebounce(username, 500)

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setDisplayName(currentProfile.display_name)
      setUsername(currentProfile.username)
      setBio(currentProfile.bio ?? '')
      setUsernameAvailable(null)
    }
  }, [isOpen, currentProfile.display_name, currentProfile.username, currentProfile.bio])

  // Check username availability
  useEffect(() => {
    const trimmed = debouncedUsername.trim()
    if (!trimmed || trimmed === currentProfile.username || trimmed.length < 3) {
      setUsernameAvailable(null)
      return
    }
    if (/\s/.test(trimmed)) {
      setUsernameAvailable(false)
      return
    }

    setCheckingUsername(true)
    const supabase = createClient()
    ;(supabase as any)
      .from('profiles')
      .select('id')
      .eq('username', trimmed)
      .maybeSingle()
      .then(({ data }: { data: unknown }) => {
        setUsernameAvailable(!data)
        setCheckingUsername(false)
      })
  }, [debouncedUsername, currentProfile.username])

  const usernameValid = username.trim().length >= 3 && !/\s/.test(username)
  const canSave =
    !saving &&
    displayName.trim().length > 0 &&
    usernameValid &&
    (username === currentProfile.username || usernameAvailable === true)

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim(),
          username: username.trim(),
          bio: bio.trim() || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'error')

      // Update authStore profile
      const supabase = createClient()
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username.trim())
        .single()

      if (updatedProfile) setProfile(updatedProfile)
      queryClient.invalidateQueries({ queryKey: ['profile'] })

      addToast('perfil actualizado ✨', 'success')
      onClose()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'error al guardar', 'error')
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Scrim */}
          <motion.div
            key="edit-profile-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(45,36,38,0.4)',
              zIndex: 60,
            }}
          />

          {/* Sheet */}
          <motion.div
            key="edit-profile-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 61,
              background: '#FFF8F5',
              borderRadius: '24px 24px 0 0',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Drag handle */}
            <div style={{
              width: 40, height: 4, borderRadius: 2,
              background: 'rgba(45,36,38,0.12)',
              margin: '10px auto 0',
              flexShrink: 0,
            }} />

            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px 14px',
              borderBottom: '1px solid rgba(201,184,232,0.2)',
              flexShrink: 0,
            }}>
              <h2 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '1.2rem',
                color: '#2D2426',
                fontWeight: 400,
              }}>
                editar perfil
              </h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(45,36,38,0.06)',
                  border: 'none', cursor: 'pointer',
                }}
                aria-label="cerrar"
              >
                <X style={{ width: 16, height: 16, color: '#7A6B72' }} />
              </motion.button>
            </div>

            {/* Form */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {/* Display name */}
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: '#7A6B72',
                  marginBottom: 6,
                  fontWeight: 500,
                }}>
                  nombre
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="tu nombre"
                  style={inputStyle}
                  maxLength={50}
                />
              </div>

              {/* Username */}
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: '#7A6B72',
                  marginBottom: 6,
                  fontWeight: 500,
                }}>
                  usuario
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    display: 'flex', alignItems: 'center',
                  }}>
                    <AtSign style={{ width: 14, height: 14, color: '#B8A8B0' }} />
                  </div>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    style={{ ...inputStyle, paddingLeft: 30 }}
                    maxLength={30}
                  />
                  {/* Availability indicator */}
                  <div style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  }}>
                    {checkingUsername && (
                      <Loader2 style={{ width: 14, height: 14, color: '#B8A8B0', animation: 'spin 1s linear infinite' }} />
                    )}
                    {!checkingUsername && usernameAvailable === true && (
                      <Check style={{ width: 14, height: 14, color: '#5A9B7A' }} />
                    )}
                    {!checkingUsername && usernameAvailable === false && (
                      <span style={{ fontSize: 12, color: '#E8849A', fontFamily: "'DM Sans', sans-serif" }}>✗</span>
                    )}
                  </div>
                </div>
                {username.trim().length < 3 && username.length > 0 && (
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#E8849A', marginTop: 4 }}>
                    mínimo 3 caracteres
                  </p>
                )}
                {/\s/.test(username) && (
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#E8849A', marginTop: 4 }}>
                    sin espacios
                  </p>
                )}
              </div>

              {/* Bio */}
              <div style={{ marginBottom: 24 }}>
                <label style={{
                  display: 'block',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: '#7A6B72',
                  marginBottom: 6,
                  fontWeight: 500,
                }}>
                  bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="cuéntanos sobre ti..."
                  maxLength={150}
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: 'none',
                    lineHeight: 1.5,
                  }}
                />
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  color: bio.length > 130 ? '#E8849A' : '#B8A8B0',
                  textAlign: 'right',
                  marginTop: 4,
                }}>
                  {bio.length}/150
                </p>
              </div>
            </div>

            {/* Save button */}
            <div style={{
              padding: '12px 20px',
              paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
              borderTop: '1px solid rgba(201,184,232,0.2)',
              background: '#FFF8F5',
              flexShrink: 0,
            }}>
              <motion.button
                onClick={handleSave}
                disabled={!canSave}
                whileTap={canSave ? { scale: 0.97 } : {}}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 16,
                  border: 'none',
                  background: canSave
                    ? 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)'
                    : 'rgba(201,184,232,0.3)',
                  color: canSave ? '#2D2426' : '#B8A8B0',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: canSave ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 0.2s',
                }}
              >
                {saving && <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />}
                {saving ? 'guardando...' : 'guardar cambios'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
