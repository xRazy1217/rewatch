export type MediaType = 'movie' | 'song' | 'album' | 'series' | 'book'

export type MoodTag =
  | 'cozy'
  | 'rainy night'
  | 'crying'
  | 'comfort'
  | 'late night drive'
  | 'study vibes'
  | 'soft girl'
  | 'healing'
  | 'nostalgic'
  | 'hype'
  | 'heartbreak'
  | 'summer'
  | 'winter feels'
  | 'romantic'
  | 'dark academia'

export type MediaSource = 'spotify' | 'tmdb' | 'google_books' | 'manual'

export interface User {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  favoriteMedia: Recommendation[]
  followersCount: number
  followingCount: number
  createdAt: string
}

export interface Recommendation {
  id: string
  userId: string
  user: User

  // Content
  type: MediaType
  title: string
  subtitle: string | null
  description: string | null
  coverUrl: string
  rating: number
  moodTags: MoodTag[]

  // External
  source: MediaSource
  externalId: string | null
  externalMetadata: {
    previewUrl?: string
    artistName?: string
    albumName?: string
    releaseYear?: number
    runtime?: number
    genres?: string[]
    authorName?: string
    pageCount?: number
    isbn?: string
    spotifyUrl?: string
    tmdbUrl?: string
    openLibraryUrl?: string
  }

  // Social
  likesCount: number
  commentsCount: number
  savesCount: number
  isPublic: boolean
  isLiked?: boolean
  isSaved?: boolean

  // Collections
  collectionIds: string[]

  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  recommendationId: string
  userId: string
  user: User
  content: string
  createdAt: string
}

export interface Collection {
  id: string
  userId: string
  name: string
  description: string | null
  coverUrl: string | null
  moodTag: MoodTag | null
  itemCount: number
  isPublic: boolean
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: 'like' | 'comment' | 'follow' | 'save'
  actorId: string
  actor: User
  recommendationId: string | null
  read: boolean
  createdAt: string
}

export const MOOD_TAG_CONFIG: Record<MoodTag, { emoji: string; label: string }> = {
  cozy: { emoji: '🕯️', label: 'cozy' },
  'rainy night': { emoji: '🌧️', label: 'rainy night' },
  crying: { emoji: '💧', label: 'crying' },
  comfort: { emoji: '🤍', label: 'comfort' },
  'late night drive': { emoji: '🌙', label: 'late night drive' },
  'study vibes': { emoji: '📚', label: 'study vibes' },
  'soft girl': { emoji: '🌸', label: 'soft girl' },
  healing: { emoji: '💙', label: 'healing' },
  nostalgic: { emoji: '🎞️', label: 'nostalgic' },
  hype: { emoji: '⚡', label: 'hype' },
  heartbreak: { emoji: '💔', label: 'heartbreak' },
  summer: { emoji: '☀️', label: 'summer' },
  'winter feels': { emoji: '❄️', label: 'winter feels' },
  romantic: { emoji: '🌹', label: 'romantic' },
  'dark academia': { emoji: '🖤', label: 'dark academia' },
}

export const MEDIA_TYPE_CONFIG: Record<MediaType, { label: string; emoji: string }> = {
  movie: { label: 'Película', emoji: '🎬' },
  song: { label: 'Canción', emoji: '🎵' },
  album: { label: 'Álbum', emoji: '💿' },
  series: { label: 'Serie', emoji: '📺' },
  book: { label: 'Libro', emoji: '📖' },
}
