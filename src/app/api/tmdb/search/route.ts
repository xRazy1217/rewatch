import { NextResponse } from 'next/server'

export interface TMDBResult {
  id: number
  title: string
  subtitle: string     // year + genres
  image: string
  mediaType: 'movie' | 'series'
  year: number | null
  overview: string
  tmdbUrl: string
  rating: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()
    const type = searchParams.get('type') ?? 'multi' // multi | movie | tv

    if (!q) return NextResponse.json({ results: [] })

    const apiKey = process.env.TMDB_API_KEY!
    const searchType = type === 'movie' ? 'movie' : type === 'tv' ? 'tv' : 'multi'

    const res = await fetch(
      `https://api.themoviedb.org/3/search/${searchType}?api_key=${apiKey}&query=${encodeURIComponent(q)}&language=es-ES&page=1`,
      { next: { revalidate: 60 } }
    )

    if (!res.ok) throw new Error('TMDB search failed')

    const data = await res.json()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = (data.results ?? []).slice(0, 10).map((item: any): TMDBResult => {
      const isTV = item.media_type === 'tv' || searchType === 'tv'
      const title = isTV ? (item.name ?? item.title ?? '') : (item.title ?? item.name ?? '')
      const dateStr = isTV ? item.first_air_date : item.release_date
      const year = dateStr ? new Date(dateStr).getFullYear() : null
      const posterPath = item.poster_path
      const image = posterPath
        ? `https://image.tmdb.org/t/p/w500${posterPath}`
        : ''

      return {
        id: item.id,
        title,
        subtitle: year ? String(year) : '',
        image,
        mediaType: isTV ? 'series' : 'movie',
        year,
        overview: item.overview ?? '',
        tmdbUrl: isTV
          ? `https://www.themoviedb.org/tv/${item.id}`
          : `https://www.themoviedb.org/movie/${item.id}`,
        rating: item.vote_average ?? 0,
      }
    }).filter((r: TMDBResult) => r.title)

    return NextResponse.json({ results })
  } catch (err) {
    console.error('TMDB search error:', err)
    return NextResponse.json({ results: [], error: 'search failed' }, { status: 500 })
  }
}
