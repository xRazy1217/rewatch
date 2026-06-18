import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Spotify album covers
      { protocol: 'https', hostname: 'i.scdn.co' },
      { protocol: 'https', hostname: 'mosaic.scdn.co' },
      // TMDB posters
      { protocol: 'https', hostname: 'image.tmdb.org' },
      // Open Library book covers
      { protocol: 'https', hostname: 'covers.openlibrary.org' },
      // Google avatars (OAuth)
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // Supabase storage
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;
