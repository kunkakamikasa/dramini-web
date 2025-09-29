'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { getAnalytics } from '@/lib/analytics'

/**
 * SPA路由跟踪Hook
 * 监听pushState/replaceState/popstate，确保路由变化时触发PV
 */
export function useSPATracking() {
  const pathname = usePathname()
  const previousPathnameRef = useRef<string>()
  const isInitialMountRef = useRef(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const analytics = getAnalytics()
    if (!analytics) {
      console.warn('Analytics not initialized in useSPATracking')
      return
    }

    // 初始化或路径变化时记录PV
    const trackRouteChange = () => {
      const currentPath = pathname
      const previousPath = previousPathnameRef.current

      // 避免重复记录同一路径
      if (previousPath !== currentPath || isInitialMountRef.current) {
        const pageTitle = document.title || ''
        const referrer = previousPath || document.referrer
        
        console.log('SPA Route change:', { from: previousPath, to: currentPath, title: pageTitle })
        
        analytics.trackEvent("page_view", {currentPath, page: currentPath, title: pageTitle, referrer: referrer })
        
        previousPathnameRef.current = currentPath
        isInitialMountRef.current = false
      }
    }

    // 手动触发（Next.js Link组件）
    trackRouteChange()

    // 监听浏览器前进/后退
    const handlePopState = () => {
      // Next.js router已经通过useEffect处理，这里不需要额外操作
      console.log('popstate detected, pathname will update via router')
    }

    // 监听编程式导航
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function(state, title, url) {
      originalPushState.call(this, state, title, url)
      
      // 只在同一路径的pushState时跟踪
      const currentUrl = new URL(url || '', window.location.origin)
      if (currentUrl.pathname !== pathname) {
        setTimeout(() => {
          trackRouteChange()
        }, 0)
      }
    }

    window.history.replaceState = function(state, title, url) {
      originalReplaceState.call(this, state, title, url)
      
      // replaceState通常不需要触发PV
      const currentUrl = new URL(url || '', window.location.origin)
      console.log('replaceState detected:', currentUrl.pathname)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      
      // 恢复原始方法
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
    }
  }, [pathname])
}

/**
 * 简化版页面跟踪Hook
 * 兼容之前的使用方式
 */
export function usePageTracking(title?: string) {
  useSPATracking()
  
  // 更新页面标题（如果需要）
  useEffect(() => {
    if (title && typeof document !== 'undefined') {
      document.title = title
    }
  }, [title])
}

/**
 * 手动触发路由跟踪
 * 用于特殊场景
 */
export function trackRouteChange(path: string, title?: string) {
  const analytics = getAnalytics()
  if (!analytics) {
    console.warn('Analytics not initialized')
    return
  }
  
  analytics.trackEvent("page_view", {path, path: path, title: title, referrer: document.referrer })
}
