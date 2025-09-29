'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import analytics from '@/lib/analytics'

export function usePageTracking(title?: string) {
  const pathname = usePathname()

  useEffect(() => {
    analytics.trackPageView(pathname, title)
  }, [pathname, title])
}

export function useAnalytics() {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackVideoPlay: analytics.trackVideoPlay.bind(analytics),
    trackRegistration: analytics.trackRegistration.bind(analytics),
    trackLogin: analytics.trackLogin.bind(analytics),
    trackPurchase: analytics.trackPurchase.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackShare: analytics.trackShare.bind(analytics)
  }
}
