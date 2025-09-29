'use client'

import { useEffect } from 'react'
import { initAnalytics } from '@/lib/analytics'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    // 初始化Analytics - 发送到正确的endpoint
    initAnalytics({
      domain: process.env.NEXT_PUBLIC_DOMAIN || 'https://shortdramini.com',
      endpoint: `${process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com'}/analytics/track`,
      batchSize: 10,
      flushInterval: 2000,
      sessionTimeout: 30 * 60 * 1000,
      heartbeatInterval: 15 * 1000
    })

    console.log('Analytics initialized with endpoint:', `${process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com'}/analytics/track`)

    return () => {
      // 清理工作在Analytics内部处理
    }
  }, [])

  return <>{children}</>
}

// 简化的初始化Hook
export function useAnalyticsInit() {
  useEffect(() => {
    initAnalytics({
      domain: process.env.NEXT_PUBLIC_DOMAIN || 'https://shortdramini.com',
      endpoint: `${process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com'}/analytics/track`,
      batchSize: 10,
      flushInterval: 2000,
      sessionTimeout: 30 * 60 * 1000,
      heartbeatInterval: 15 * 1000
    })
  }, [])
}
