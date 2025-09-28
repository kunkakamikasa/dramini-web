import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/toast-provider'

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
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}
