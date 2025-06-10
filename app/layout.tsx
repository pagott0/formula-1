import type { Metadata } from 'next'
import './globals.css'
import ClientSideToastContainer from '@/components/toast'

export const metadata: Metadata = {
  title: 'Fórmula 1',
  description: 'Fórmula 1',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <ClientSideToastContainer />
      <body>{children}</body>
    </html>
  )
}
