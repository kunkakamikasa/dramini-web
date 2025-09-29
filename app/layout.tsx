import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/toast-provider'
import { AnalyticsProvider } from '@/components/AnalyticsProvider'

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
          {children}
          <ToastProvider />
        </AnalyticsProvider>
      </body>
    </html>
  )
}
