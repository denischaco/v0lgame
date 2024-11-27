import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Conductores de Olga',
  description: 'Creado por @denischaco',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}