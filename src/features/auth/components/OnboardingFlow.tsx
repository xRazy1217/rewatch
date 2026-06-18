'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

const STEPS = 3

const stepVariants: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
}

export function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function checkUsername(value: string) {
    setUsername(value)
    setUsernameError(null)
    if (value.length < 3) return
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', value)
      .single()
    if (data) setUsernameError('ese nombre ya está en uso')
  }

  async function handleFinish() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.toLowerCase().trim(),
        display_name: displayName.trim() || username,
        bio: bio.trim() || null,
      }),
    })

    const error = res.ok ? null : await res.json()

    if (!error) {
      router.push('/feed')
      router.refresh()
    } else {
      setLoading(false)
    }
  }

  const canNext1 = username.length >= 3 && !usernameError && displayName.length >= 2
  const progressWidth = `${(step / STEPS) * 100}%`

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1
          className="text-3xl mb-1"
          style={{ fontFamily: "'DM Serif Display', serif", color: '#2D2426', fontWeight: 400 }}
        >
          rewatch
        </h1>
        <p className="text-xs" style={{ color: '#B8A8B0', fontFamily: "'DM Sans', sans-serif" }}>
          paso {step} de {STEPS}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 rounded-full" style={{ background: 'rgba(201,184,232,0.3)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #F4A7B9, #C9B8E8)' }}
          animate={{ width: progressWidth }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>

      {/* Steps */}
      <div
        className="rounded-[28px] p-6 overflow-hidden"
        style={{ background: '#FFF8F5', boxShadow: '0 4px 32px rgba(244,167,185,0.14)' }}
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
              <div>
                <p className="text-lg font-semibold mb-1" style={{ color: '#2D2426', fontFamily: "'Inter', sans-serif" }}>
                  ¿cómo te llamas?
                </p>
                <p className="text-sm" style={{ color: '#7A6B72', fontFamily: "'Inter', sans-serif" }}>
                  elige tu nombre y usuario
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="tu nombre"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    maxLength={30}
                    className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                    style={{
                      background: '#FFFFFF',
                      border: '1.5px solid rgba(201,184,232,0.3)',
                      color: '#2D2426',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  />
                </div>

                <div>
                  <div className="relative">
                    <span
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm"
                      style={{ color: '#B8A8B0', fontFamily: "'DM Sans', sans-serif" }}
                    >@</span>
                    <input
                      type="text"
                      placeholder="usuario"
                      value={username}
                      onChange={e => checkUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                      maxLength={20}
                      className="w-full pl-8 pr-4 py-3 rounded-2xl text-sm outline-none"
                      style={{
                        background: '#FFFFFF',
                        border: `1.5px solid ${usernameError ? '#E8849A' : 'rgba(201,184,232,0.3)'}`,
                        color: '#2D2426',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    />
                  </div>
                  {usernameError && (
                    <p className="text-xs mt-1 ml-1" style={{ color: '#E8849A', fontFamily: "'DM Sans', sans-serif" }}>
                      {usernameError}
                    </p>
                  )}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(2)}
                disabled={!canNext1}
                className="w-full py-3 rounded-2xl font-medium text-sm"
                style={{
                  background: canNext1 ? 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)' : 'rgba(201,184,232,0.3)',
                  color: canNext1 ? '#2D2426' : '#B8A8B0',
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: canNext1 ? '0 4px 16px rgba(244,167,185,0.35)' : 'none',
                }}
              >
                continuar
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
              <div>
                <p className="text-lg font-semibold mb-1" style={{ color: '#2D2426', fontFamily: "'Inter', sans-serif" }}>
                  cuéntanos algo
                </p>
                <p className="text-sm" style={{ color: '#7A6B72', fontFamily: "'Inter', sans-serif" }}>
                  una bio corta (opcional)
                </p>
              </div>

              <textarea
                placeholder="películas de llanto y demasiado café ☕"
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={150}
                rows={3}
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid rgba(201,184,232,0.3)',
                  color: '#2D2426',
                  fontFamily: "'Inter', sans-serif",
                }}
              />
              <p className="text-xs text-right" style={{ color: '#B8A8B0', fontFamily: "'DM Sans', sans-serif" }}>
                {bio.length}/150
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-2xl font-medium text-sm"
                  style={{
                    background: 'rgba(201,184,232,0.2)',
                    color: '#7A6B72',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  atrás
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-2xl font-medium text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
                    color: '#2D2426',
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: '0 4px 16px rgba(244,167,185,0.35)',
                  }}
                >
                  continuar
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-5 text-center">
              <div className="text-5xl animate-float">🌸</div>
              <div>
                <p className="text-lg font-semibold" style={{ color: '#2D2426', fontFamily: "'Inter', sans-serif" }}>
                  listo, {displayName}
                </p>
                <p className="text-sm mt-1" style={{ color: '#7A6B72', fontFamily: "'Inter', sans-serif" }}>
                  ya eres parte de rewatch
                </p>
              </div>

              <div
                className="p-4 rounded-2xl text-left space-y-1"
                style={{ background: '#FFFFFF', border: '1.5px solid rgba(201,184,232,0.3)' }}
              >
                <p className="text-sm font-semibold" style={{ color: '#2D2426', fontFamily: "'Inter', sans-serif" }}>
                  @{username}
                </p>
                {bio && (
                  <p className="text-xs" style={{ color: '#7A6B72', fontFamily: "'Inter', sans-serif" }}>
                    {bio}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-2xl font-medium text-sm"
                  style={{
                    background: 'rgba(201,184,232,0.2)',
                    color: '#7A6B72',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  atrás
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleFinish}
                  disabled={loading}
                  className="flex-1 py-3 rounded-2xl font-medium text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
                    color: '#2D2426',
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: '0 4px 16px rgba(244,167,185,0.35)',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? 'entrando...' : 'empezar ✨'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
