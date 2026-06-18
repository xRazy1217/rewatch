'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('algo salió mal, revisa tus datos')
      setLoading(false)
      return
    }
    router.push('/feed')
    router.refresh()
  }

  async function handleGoogleLogin() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full max-w-sm"
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <h1
          className="text-4xl mb-2"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: '#2D2426', fontWeight: 400 }}
        >
          rewatch
        </h1>
        <p className="text-sm" style={{ color: '#7A6B72', fontFamily: "'Inter', sans-serif" }}>
          comparte lo que te mueve
        </p>
      </div>

      {/* Card */}
      <div
        className="rounded-[28px] p-6 space-y-4"
        style={{ background: '#FFF8F5', boxShadow: '0 4px 32px rgba(244,167,185,0.14)' }}
      >
        {/* Google */}
        <motion.button
          type="button"
          onClick={handleGoogleLogin}
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl font-medium text-sm transition-all"
          style={{
            background: '#FFFFFF',
            border: '1.5px solid rgba(201,184,232,0.4)',
            color: '#2D2426',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
          </svg>
          entrar con Google
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'rgba(201,184,232,0.3)' }} />
          <span className="text-xs" style={{ color: '#B8A8B0', fontFamily: "'DM Sans', sans-serif" }}>o</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(201,184,232,0.3)' }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#B8A8B0' }} />
            <input
              type="email"
              placeholder="tu email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm outline-none transition-all"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid rgba(201,184,232,0.3)',
                color: '#2D2426',
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#B8A8B0' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-12 py-3 rounded-2xl text-sm outline-none transition-all"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid rgba(201,184,232,0.3)',
                color: '#2D2426',
                fontFamily: "'Inter', sans-serif",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
              aria-label={showPassword ? 'ocultar contraseña' : 'mostrar contraseña'}
            >
              {showPassword
                ? <EyeOff className="w-4 h-4" style={{ color: '#B8A8B0' }} />
                : <Eye className="w-4 h-4" style={{ color: '#B8A8B0' }} />
              }
            </button>
          </div>

          {error && (
            <p className="text-xs text-center" style={{ color: '#E8849A', fontFamily: "'DM Sans', sans-serif" }}>
              {error}
            </p>
          )}

          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="w-full py-3 rounded-2xl font-medium text-sm transition-all"
            style={{
              background: 'linear-gradient(135deg, #F4A7B9 0%, #C9B8E8 100%)',
              color: '#2D2426',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 4px 16px rgba(244,167,185,0.35)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'entrando...' : 'entrar'}
          </motion.button>
        </form>
      </div>

      {/* Signup link */}
      <p className="text-center mt-5 text-sm" style={{ color: '#7A6B72', fontFamily: "'Inter', sans-serif" }}>
        ¿no tienes cuenta?{' '}
        <Link href="/signup" className="font-medium underline underline-offset-2" style={{ color: '#F4A7B9' }}>
          crear una
        </Link>
      </p>
    </motion.div>
  )
}
