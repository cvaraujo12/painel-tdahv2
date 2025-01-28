/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilita otimizações de produção
  swcMinify: true,
  
  // Otimiza imagens
  images: {
    domains: ['emrttphdkludlvnysqnh.supabase.co'], // Adicione seu domínio do Supabase aqui
    formats: ['image/avif', 'image/webp'],
  },

  // Configurações de compilação
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Configurações de headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig 