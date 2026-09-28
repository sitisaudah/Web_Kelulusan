/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        // Supabase Storage — ganti 'your-project-ref' dengan project ID Anda
        // Contoh: jika URL Supabase Anda adalah https://abcdefgh.supabase.co
        // maka hostname-nya adalah 'abcdefgh.supabase.co'
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
