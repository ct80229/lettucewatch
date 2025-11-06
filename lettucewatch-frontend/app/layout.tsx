import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const customFont = localFont({
  src: '../public/fonts/providence-sans.otf',
  variable: '--font-custom',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'lettucewatch!',
  description: 'compare ur letterboxd watchlists!'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${customFont.variable}`}>
      <body className={customFont.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
