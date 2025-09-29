import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/toast-provider'
import { AnalyticsProvider } from '@/components/AnalyticsProvider'
import { AnalyticsInit } from '@/components/AnalyticsInit'

export const metadata: Metadata = {
  title: 'Dramini',
  description: 'Your streaming platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AnalyticsProvider>
          <AnalyticsInit />
          {children}
          <ToastProvider />
        </AnalyticsProvider>
      </body>
    </html>
  )
}
