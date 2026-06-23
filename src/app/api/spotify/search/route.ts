import { NextResponse } from 'next/server'

export interface MusicTrack {
  id: string
  title: string
  artist: string
  album: string
  image: string
  previewUrl: string | null
  spotifyUrl: string   // search link to Spotify
  appleMusicUrl: string
  duration: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()
    const type = searchParams.get('type') ?? 'track' // track | album

    if (!q) return NextResponse.json({ results: [] })

    const mediaType = type === 'album' ? 'album' : 'music'
    const entity = type === 'album' ? 'album' : 'song'

    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=${mediaType}&entity=${entity}&limit=10&lang=es_es`,
      { next: { revalidate: 60 } }
    )

    if (!res.ok) throw new Error(`iTunes search failed: ${res.status}`)

    const data = await res.json()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = (data.results ?? []).map((item: any): MusicTrack => {
      // Try to get image with fallback: artworkUrl600 > artworkUrl100 > empty string
      let image = ''
      if (item.artworkUrl600) {
        image = item.artworkUrl600
      } else if (item.artworkUrl100) {
        image = item.artworkUrl100
      }
      
      const spotifySearch = `https://open.spotify.com/search/${encodeURIComponent(`${item.trackName ?? item.collectionName} ${item.artistName}`)}`
      const appleMusicUrl = item.trackViewUrl ?? item.collectionViewUrl ?? ''

      return {
        id: String(item.trackId ?? item.collectionId ?? Math.random()),
        title: item.trackName ?? item.collectionName ?? '',
        artist: item.artistName ?? '',
        album: item.collectionName ?? '',
        image,
        previewUrl: item.previewUrl ?? null,
        spotifyUrl: spotifySearch,
        appleMusicUrl,
        duration: item.trackTimeMillis ?? 0,
      }
    })

    return NextResponse.json({ results })
  } catch (err) {
    console.error('iTunes search error:', err)
    return NextResponse.json({ results: [], error: String(err) }, { status: 500 })
  }
}
