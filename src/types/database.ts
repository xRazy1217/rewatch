export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      collection_items: {
        Row: { added_at: string | null; collection_id: string; recommendation_id: string }
        Insert: { added_at?: string | null; collection_id: string; recommendation_id: string }
        Update: { added_at?: string | null; collection_id?: string; recommendation_id?: string }
      }
      collections: {
        Row: { cover_url: string | null; created_at: string | null; description: string | null; id: string; is_public: boolean | null; item_count: number | null; mood_tag: string | null; name: string; user_id: string }
        Insert: { cover_url?: string | null; created_at?: string | null; description?: string | null; id?: string; is_public?: boolean | null; item_count?: number | null; mood_tag?: string | null; name: string; user_id: string }
        Update: { cover_url?: string | null; created_at?: string | null; description?: string | null; id?: string; is_public?: boolean | null; item_count?: number | null; mood_tag?: string | null; name?: string; user_id?: string }
      }
      comments: {
        Row: { content: string; created_at: string | null; id: string; recommendation_id: string; user_id: string }
        Insert: { content: string; created_at?: string | null; id?: string; recommendation_id: string; user_id: string }
        Update: { content?: string; created_at?: string | null; id?: string; recommendation_id?: string; user_id?: string }
      }
      follows: {
        Row: { created_at: string | null; follower_id: string; following_id: string }
        Insert: { created_at?: string | null; follower_id: string; following_id: string }
        Update: { created_at?: string | null; follower_id?: string; following_id?: string }
      }
      likes: {
        Row: { created_at: string | null; recommendation_id: string; user_id: string }
        Insert: { created_at?: string | null; recommendation_id: string; user_id: string }
        Update: { created_at?: string | null; recommendation_id?: string; user_id?: string }
      }
      notifications: {
        Row: { actor_id: string; created_at: string | null; id: string; read: boolean | null; recommendation_id: string | null; type: string; user_id: string }
        Insert: { actor_id: string; created_at?: string | null; id?: string; read?: boolean | null; recommendation_id?: string | null; type: string; user_id: string }
        Update: { actor_id?: string; created_at?: string | null; id?: string; read?: boolean | null; recommendation_id?: string | null; type?: string; user_id?: string }
      }
      profiles: {
        Row: { avatar_url: string | null; bio: string | null; created_at: string | null; display_name: string; followers_count: number | null; following_count: number | null; id: string; username: string }
        Insert: { avatar_url?: string | null; bio?: string | null; created_at?: string | null; display_name: string; followers_count?: number | null; following_count?: number | null; id: string; username: string }
        Update: { avatar_url?: string | null; bio?: string | null; created_at?: string | null; display_name?: string; followers_count?: number | null; following_count?: number | null; id?: string; username?: string }
      }
      recommendations: {
        Row: { comments_count: number | null; cover_url: string; created_at: string | null; description: string | null; external_id: string | null; external_metadata: Json | null; id: string; is_public: boolean | null; likes_count: number | null; mood_tags: string[] | null; rating: number | null; saves_count: number | null; source: string; subtitle: string | null; title: string; type: string; updated_at: string | null; user_id: string }
        Insert: { comments_count?: number | null; cover_url?: string; created_at?: string | null; description?: string | null; external_id?: string | null; external_metadata?: Json | null; id?: string; is_public?: boolean | null; likes_count?: number | null; mood_tags?: string[] | null; rating?: number | null; saves_count?: number | null; source?: string; subtitle?: string | null; title: string; type: string; updated_at?: string | null; user_id: string }
        Update: { comments_count?: number | null; cover_url?: string; created_at?: string | null; description?: string | null; external_id?: string | null; external_metadata?: Json | null; id?: string; is_public?: boolean | null; likes_count?: number | null; mood_tags?: string[] | null; rating?: number | null; saves_count?: number | null; source?: string; subtitle?: string | null; title?: string; type?: string; updated_at?: string | null; user_id?: string }
      }
      saved_items: {
        Row: { created_at: string | null; recommendation_id: string; user_id: string }
        Insert: { created_at?: string | null; recommendation_id: string; user_id: string }
        Update: { created_at?: string | null; recommendation_id?: string; user_id?: string }
      }
    }
  }
}
