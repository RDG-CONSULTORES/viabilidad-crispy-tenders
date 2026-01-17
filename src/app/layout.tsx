import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Crispy Tenders - Dashboard de Viabilidad',
  description: 'Análisis de viabilidad para franquicia Crispy Tenders en el Área Metropolitana de Monterrey',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-gradient-to-r from-crispy-500 to-crispy-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🍗</span>
                  <div>
                    <h1 className="text-xl font-bold">Crispy Tenders</h1>
                    <p className="text-sm text-crispy-100">Dashboard de Viabilidad</p>
                  </div>
                </div>

                <nav className="flex gap-6">
                  <a href="/" className="hover:text-crispy-200 transition font-medium">
                    Dashboard
                  </a>
                  <a href="/sucursales" className="hover:text-crispy-200 transition font-medium">
                    Sucursales
                  </a>
                  <a href="/analisis" className="hover:text-crispy-200 transition font-medium">
                    Análisis
                  </a>
                  <a href="/competencia" className="hover:text-crispy-200 transition font-medium">
                    Competencia
                  </a>
                  <a href="/configuracion" className="hover:text-crispy-200 transition font-medium">
                    ⚙️ Config
                  </a>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 py-6">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-gray-800 text-gray-300 py-4 mt-8">
            <div className="max-w-7xl mx-auto px-4 text-center text-sm">
              <p>
                📊 Dashboard de Viabilidad | Crispy Tenders México |
                <span className="text-crispy-400"> Área Metropolitana de Monterrey</span>
              </p>
              <p className="text-gray-500 mt-1">
                Datos estimados con fines de análisis. Validar con investigación de campo.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
