'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getAnalytics } from '@/lib/analytics'
import { usePageTracking as useSPAtracking } from '@/hooks/useSPATracking'

// 保留向后兼容的usePageTracking
// 内部自动使用新的SPA跟踪机制
export function usePageTracking(title?: string) {
  useSPAtracking(title)
}

// 通用分析事件 Hook
export function useAnalytics() {
  const analytics = getAnalytics()
  
  if (!analytics) {
    console.warn('Analytics not initialized')
    return {
      trackEvent: () => console.warn('Analytics not initialized'),
      trackLogin: () => console.warn('Analytics not initialized'),
      trackRegistration: () => console.warn('Analytics not initialized'),
      trackVideoPlay: () => console.warn('Analytics not initialized'),
      trackPurchase: () => console.warn('Analytics not initialized'),
      trackSearch: () => console.warn('Analytics not initialized'),
      trackShare: () => console.warn('Analytics not initialized'),
      setUserId: () => console.warn('Analytics not initialized'),
    }
  }

  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackLogin: analytics.trackLogin.bind(analytics),
    trackRegistration: analytics.trackRegistration.bind(analytics),
    trackVideoPlay: analytics.trackVideoPlay.bind(analytics),
    trackPurchase: analytics.trackPurchase.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackShare: analytics.trackShare.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
  }
}