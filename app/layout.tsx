import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConditionalWrapper } from '@/components/ConditionalWrapper'
import { AnalyticsInit } from '@/components/AnalyticsInit'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dramini - Every Second Is Drama',
  description: '短剧平台，每一秒都是剧情',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AnalyticsInit />
        <ConditionalWrapper>
          {children}
        </ConditionalWrapper>
      </body>
    </html>
  )
}
