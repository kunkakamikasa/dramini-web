'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export function ConditionalWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // 如果是剧集页面，不显示Header和Footer
  if (pathname && pathname.startsWith('/drama/')) {
    return <>{children}</>
  }
  
  // 其他页面显示完整布局
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
    </div>
  )
}