import { NextResponse } from 'next/server'

// Cache token in module scope (server memory)
let cachedToken: { token: string; expiresAt: number } | null = null

async function getSpotifyToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID!
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) throw new Error('Failed to get Spotify token')

  const data = await res.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }

  return cachedToken.token
}

export interface SpotifyTrack {
  id: string
  title: string
  artist: string
  album: string
  image: string
  previewUrl: string | null
  spotifyUrl: string
  duration: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()
    const type = searchParams.get('type') ?? 'track' // track | album

    if (!q) return NextResponse.json({ results: [] })

    const token = await getSpotifyToken()

    const searchType = type === 'album' ? 'album' : 'track'
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=${searchType}&limit=10&market=ES`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!res.ok) throw new Error('Spotify search failed')

    const data = await res.json()

    if (searchType === 'album') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results = (data.albums?.items ?? []).map((album: any): SpotifyTrack => ({
        id: album.id,
        title: album.name,
        artist: album.artists?.map((a: { name: string }) => a.name).join(', ') ?? '',
        album: album.name,
        image: album.images?.[0]?.url ?? '',
        previewUrl: null,
        spotifyUrl: album.external_urls?.spotify ?? '',
        duration: 0,
      }))
      return NextResponse.json({ results })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = (data.tracks?.items ?? []).map((track: any): SpotifyTrack => ({
      id: track.id,
      title: track.name,
      artist: track.artists?.map((a: { name: string }) => a.name).join(', ') ?? '',
      album: track.album?.name ?? '',
      image: track.album?.images?.[0]?.url ?? '',
      previewUrl: track.preview_url ?? null,
      spotifyUrl: track.external_urls?.spotify ?? '',
      duration: track.duration_ms ?? 0,
    }))

    return NextResponse.json({ results })
  } catch (err) {
    console.error('Spotify search error:', err)
    return NextResponse.json({ results: [], error: 'search failed' }, { status: 500 })
  }
}
