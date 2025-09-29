'use client'

import { useEffect } from 'react'
import { initAnalytics } from '@/lib/analytics'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    // 初始化Analytics
    const analytics = initAnalytics({
      domain: process.env.NEXT_PUBLIC_DOMAIN || 'https://shortdramini.com',
      endpoint: `${process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com/api/v1'}/analytics/track`,
      batchSize: 10,
      flushInterval: 2000,
      sessionTimeout: 30 * 60 * 1000, // 30分钟
      heartbeatInterval: 15 * 1000   // 15秒
    })

    // 记录会话开始
    analytics.trackSession()

    // 第三方集成（GA4）
    if (typeof window !== 'undefined' && (window as any).gtag) {
      // 通用页面跟踪
      analytics.trackEvent = (name: string, props: any) => {
        const realEventId = analytics.trackEvent(name, props)
        
        // 同步到GA4
        ;(window as any).gtag('event', name, {
          event_category: 'engagement',
          event_label: JSON.stringify(props),
          custom_parameter_event_id: realEventId
        })
        
        return realEventId
      }

      // 页面访问同步
      const originalTrackPageView = analytics.trackPageView.bind(analytics)
      analytics.trackPageView = (path: string, title?: string, referrer?: string) => {
        const result = originalTrackPageView(path, title, referrer)
        
        // 同步到GA4
        ;(window as any).gtag('config', process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX', {
          page_title: title || document.title,
          page_location: window.location.href,
          page_referrer: referrer
        })
        
        return result
      }
    }

    // Plausible集成
    if (typeof window !== 'undefined' && (window as any).plausible) {
      // 页面访问同步
      const originalTrackPageView = analytics.trackPageView.bind(analytics)
      analytics.trackPageView = (path: string, title?: string, referrer?: string) => {
        const result = originalTrackPageView(path, title, referrer)
        
        // 同步到Plausible
        ;(window as any).plausible('pageview', {
          u: window.location.href,
          d: process.env.NEXT_PUBLIC_DOMAIN || 'shortdramini.com',
          r: referrer
        })
        
        return result
      }
    }

    return () => {
      // 清理工作在Analytics内部处理
    }
  }, [])

  return <>{children}</>
}

/**
 * Analytics初始化Hook（用于非Provider场景）
 */
export function useAnalyticsInit() {
  useEffect(() => {
    const analytics = initAnalytics({
      domain: process.env.NEXT_PUBLIC_DOMAIN || 'https://shortdramini.com',
      endpoint: `${process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com/api/v1'}/analytics/track`,
      batchSize: 10,
      flushInterval: 2000,
      sessionTimeout: 30 * 60 * 1000,
      heartbeatInterval: 15 * 1000
    })

    analytics.trackSession()
  }, [])
}
