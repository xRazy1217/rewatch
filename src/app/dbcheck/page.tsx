import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DBCheckPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'NOT SET'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'NOT SET'
  const spotifyId = process.env.SPOTIFY_CLIENT_ID ?? 'NOT SET'
  const tmdb = process.env.TMDB_API_KEY ?? 'NOT SET'

  let dbStatus = 'checking...'
  let profileCount = 0
  let recCount = 0
  let authUser = null
  let dbError = null

  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    authUser = user?.email ?? 'not logged in'

    // Check profiles table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: pc, error: pe } = await (supabase as any)
      .from('profiles').select('*', { count: 'exact', head: true })
    if (pe) throw pe
    profileCount = pc ?? 0

    // Check recommendations table  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: rc, error: re } = await (supabase as any)
      .from('recommendations').select('*', { count: 'exact', head: true })
    if (re) throw re
    recCount = rc ?? 0

    dbStatus = 'connected ✅'
  } catch (e: unknown) {
    dbStatus = 'error ❌'
    dbError = e instanceof Error ? e.message : String(e)
  }

  const keyPreview = key !== 'NOT SET' ? `${key.slice(0, 20)}...` : 'NOT SET'
  const urlOk = url.endsWith('.co')

  return (
    <div style={{ fontFamily: 'monospace', padding: 32, background: '#FDFAF7', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 24, color: '#2D2426' }}>🔍 DB Check</h1>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#7A6B72', marginBottom: 8 }}>Environment Variables</h2>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            <Row label="NEXT_PUBLIC_SUPABASE_URL" value={url} ok={urlOk} />
            <Row label="URL ends with .co?" value={urlOk ? 'YES ✅' : 'NO ❌ — should be .co not .com'} ok={urlOk} />
            <Row label="NEXT_PUBLIC_SUPABASE_ANON_KEY" value={keyPreview} ok={key !== 'NOT SET'} />
            <Row label="SPOTIFY_CLIENT_ID" value={spotifyId !== 'NOT SET' ? '✅ set' : '❌ NOT SET'} ok={spotifyId !== 'NOT SET'} />
            <Row label="TMDB_API_KEY" value={tmdb !== 'NOT SET' ? '✅ set' : '❌ NOT SET'} ok={tmdb !== 'NOT SET'} />
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#7A6B72', marginBottom: 8 }}>Database Connection</h2>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            <Row label="Status" value={dbStatus} ok={dbStatus.includes('✅')} />
            <Row label="Auth user" value={authUser ?? 'null'} ok={!!authUser} />
            <Row label="Profiles count" value={String(profileCount)} ok={true} />
            <Row label="Recommendations count" value={String(recCount)} ok={true} />
            {dbError && <Row label="Error" value={dbError} ok={false} />}
          </tbody>
        </table>
      </section>

      <p style={{ color: '#B8A8B0', fontSize: '0.8rem' }}>
        Remove this page before going to production. Visit: /dbcheck
      </p>
    </div>
  )
}

function Row({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <tr style={{ borderBottom: '1px solid rgba(201,184,232,0.3)' }}>
      <td style={{ padding: '8px 16px 8px 0', color: '#7A6B72', width: 300 }}>{label}</td>
      <td style={{ padding: '8px 0', color: ok ? '#2D5A3A' : '#E8849A', fontWeight: 600 }}>{value}</td>
    </tr>
  )
}
