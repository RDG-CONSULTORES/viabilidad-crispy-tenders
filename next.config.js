/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizaciones para producción
  swcMinify: true,

  // Configuración de imágenes
  images: {
    domains: ['tile.openstreetmap.org'],
  },

  // Headers de seguridad
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
        ],
      },
    ];
  },
};

module.exports = nextConfig;
