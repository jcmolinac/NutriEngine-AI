import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FFC800',
};

export const metadata: Metadata = {
  title: 'NutriEngine AI',
  description: 'Motor integral de IA para escaneo de platos, conteo calórico, registro por voz, metas antropométricas, planificación de comidas y coaching nutricional con salida JSON.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NutriEngine',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'NutriEngine AI',
    description: 'Motor integral de IA para escaneo de platos, conteo calórico, registro por voz, metas antropométricas, planificación de comidas y coaching nutricional con salida JSON.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NutriEngine AI',
    description: 'Motor integral de IA para escaneo de platos, conteo calórico, registro por voz, metas antropométricas, planificación de comidas y coaching nutricional con salida JSON.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="antialiased overflow-hidden touch-manipulation" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
