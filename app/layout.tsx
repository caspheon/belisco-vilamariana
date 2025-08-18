import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sinuquinha do Belisco',
  description: 'Sistema de gerenciamento de jogadores e partidas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  )
}
