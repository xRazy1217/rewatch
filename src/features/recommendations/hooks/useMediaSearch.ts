'use client'

import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/useDebounce'
import type { MediaType } from '@/types'

export interface MediaSearchResult {
  id: string
  title: string
  subtitle: string
  image: string
  mediaType: MediaType
  extraMetadata: Record<string, unknown>
  externalUrl: string
}

async function searchMedia(query: string, mediaType: MediaType): Promise<MediaSearchResult[]> {
  if (!query.trim()) return []

  if (mediaType === 'song') {
    const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&type=track`)
    const { results } = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (results ?? []).map((t: any): MediaSearchResult => ({
      id: t.id,
      title: t.title,
      subtitle: `${t.artist} · ${t.album}`,
      image: t.image,
      mediaType: 'song',
      externalUrl: t.spotifyUrl,
      extraMetadata: {
        artistName: t.artist,
        albumName: t.album,
        previewUrl: t.previewUrl,
        spotifyUrl: t.spotifyUrl,
        duration: t.duration,
      },
    }))
  }

  if (mediaType === 'album') {
    const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&type=album`)
    const { results } = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (results ?? []).map((t: any): MediaSearchResult => ({
      id: t.id,
      title: t.title,
      subtitle: t.artist,
      image: t.image,
      mediaType: 'album',
      externalUrl: t.spotifyUrl,
      extraMetadata: {
        artistName: t.artist,
        spotifyUrl: t.spotifyUrl,
      },
    }))
  }

  if (mediaType === 'movie') {
    const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}&type=movie`)
    const { results } = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (results ?? []).map((m: any): MediaSearchResult => ({
      id: String(m.id),
      title: m.title,
      subtitle: m.year ? String(m.year) : '',
      image: m.image,
      mediaType: 'movie',
      externalUrl: m.tmdbUrl,
      extraMetadata: {
        releaseYear: m.year,
        overview: m.overview,
        tmdbUrl: m.tmdbUrl,
        tmdbRating: m.rating,
      },
    }))
  }

  if (mediaType === 'series') {
    const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}&type=tv`)
    const { results } = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (results ?? []).map((m: any): MediaSearchResult => ({
      id: String(m.id),
      title: m.title,
      subtitle: m.year ? String(m.year) : '',
      image: m.image,
      mediaType: 'series',
      externalUrl: m.tmdbUrl,
      extraMetadata: {
        releaseYear: m.year,
        overview: m.overview,
        tmdbUrl: m.tmdbUrl,
      },
    }))
  }

  if (mediaType === 'book') {
    const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`)
    const { results } = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (results ?? []).map((b: any): MediaSearchResult => ({
      id: b.id,
      title: b.title,
      subtitle: b.author,
      image: b.image,
      mediaType: 'book',
      externalUrl: b.openLibraryUrl,
      extraMetadata: {
        authorName: b.author,
        pageCount: b.pageCount,
        isbn: b.isbn,
        year: b.year,
      },
    }))
  }

  return []
}

export function useMediaSearch(query: string, mediaType: MediaType) {
  const debouncedQuery = useDebounce(query, 400)

  return useQuery({
    queryKey: ['media-search', debouncedQuery, mediaType],
    queryFn: () => searchMedia(debouncedQuery, mediaType),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  })
}
