
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.wikimedia.org', // Covers upload.wikimedia.org and others
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.wikia.nocookie.net', // For Fandom/Wikia images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net', // For MyAnimeList images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.kitsu.io', // For Kitsu images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's4.anilist.co', // For AniList images
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
