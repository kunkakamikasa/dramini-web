'use client'

import { v4 as uuidv4 } from 'uuid'

// Types
interface AnalyticsConfig {
  domain: string
  endpoint: string
  batchSize?: number
  flushInterval?: number
  sessionTimeout?: number
  heartbeatInterval?: number
}

interface AnalyticsEvent {
  event_id: string
  event_name: string
  visitor_id: string
  session_id: string
  user_id?: string
  props: any
  created_at: string
}

class Analytics {
  private visitorId: string | null = null
  private sessionId: string | null = null
  private userId: string | null = null
  private apiBase: string = ''
  private eventQueue: AnalyticsEvent[] = []

  initAnalytics(config: AnalyticsConfig): void {
    try {
      this.initSession()
      this.loadUser()
      this.apiBase = config.endpoint || '/api/v1/analytics'
      
      if (typeof window !== 'undefined') {
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this))
      }
      
      console.log('Analytics initialized successfully')
    } catch (error) {
      console.error('Analytics initialization failed:', error)
    }
  }

  private initSession(): void {
    if (typeof window === 'undefined') return

    // 获取或创建visitor_id
    let visitorId = localStorage.getItem('dramini_analytics_visitor_id')
    if (!visitorId) {
      visitorId = uuidv4()
      localStorage.setItem('dramini_analytics_visitor_id', visitorId)
    }
    this.visitorId = visitorId

    // 获取或创建session_id（30分钟会话）
    const storagePrefix = 'dramini_analytics_'
    const lastSessionTs = localStorage.getItem(storagePrefix + 'session_last_ts')
    const now = Date.now()
    const sessionTimeout = 30 * 60 * 1000
    
    if (!lastSessionTs || (now - parseInt(lastSessionTs)) > sessionTimeout) {
      this.sessionId = uuidv4()
      localStorage.setItem(storagePrefix + 'session_id', this.sessionId)
      localStorage.setItem(storagePrefix + 'session_last_ts', now.toString())
    } else {
      this.sessionId = localStorage.getItem(storagePrefix + 'session_id') || uuidv4()
      localStorage.setItem(storagePrefix + 'session_last_ts', now.toString())
    }
  }

  private loadUser(): void {
    if (typeof window === 'undefined') return
    
    this.userId = localStorage.getItem('dramini_user_id') || null
  }

  private sendEvent(event: AnalyticsEvent): void {
    this.eventQueue.push(event)
    
    if (this.eventQueue.length >= 5) {
      this.flushEvents()
    }
  }

  private flushEvents(): void {
    if (this.eventQueue.length === 0) return
    
    const events = [...this.eventQueue]
    this.eventQueue = []

    const payload = JSON.stringify({ events })
    
    fetch(this.apiBase + '/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-analytics-key': 'dramini2025'
      },
      body: payload,
      keepalive: true
    }).catch(error => {
      console.warn('Analytics flush failed:', error)
    })
  }

  trackEvent(eventName: string, props?: any): void {
    const event: AnalyticsEvent = {
      event_id: uuidv4(),
      event_name: eventName,
      visitor_id: this.visitorId!,
      session_id: this.sessionId!,
      user_id: this.userId || undefined,
      props: props || {},
      created_at: new Date().toISOString()
    }
    
    this.sendEvent(event)
  }

  trackLogin(userId: string, method?: string): void {
    this.trackEvent('login', { user_id: userId, method: method || 'email' })
  }

  trackRegistration(userId: string, method?: string): void {
    this.trackEvent('registration', { user_id: userId, method: method || 'email' })
  }

  trackVideoPlay(contentId: string, contentType: string, duration?: number): void {
    this.trackEvent('video_play', { 
      content_id: contentId, 
      content_type: contentType,
      duration: duration || 0
    })
  }

  trackPurchase(orderId: string, amount: number, currency: string, method?: string): void {
    this.trackEvent('purchase', {
      order_id: orderId,
      amount: amount,
      currency: currency,
      method: method || 'unknown'
    })
  }

  trackSearch(query: string, results?: number): void {
    this.trackEvent('search', {
      query: query,
      results_count: results || 0
    })
  }

  trackShare(contentId: string, contentType: string, platform?: string): void {
    this.trackEvent('share', {
      content_id: contentId,
      content_type: contentType,
      platform: platform || 'unknown'
    })
  }

  setUserId(userId: string): void {
    this.userId = userId
    if (typeof window !== 'undefined') {
      localStorage.setItem('dramini_user_id', userId)
    }
  }

  private handleVisibilityChange(): void {
    this.flushEvents()
  }

  private handleBeforeUnload(): void {
    this.flushEvents()
  }

  getVisitorId(): string | null {
    return this.visitorId
  }

  getSessionId(): string | null {
    return this.sessionId
  }
}

// 全局实例
let analyticsInstance: Analytics | null = null

export function initAnalytics(config: AnalyticsConfig): void {
  analyticsInstance = new Analytics()
  analyticsInstance.initAnalytics(config)
}

export function getAnalytics(): Analytics | null {
  return analyticsInstance
}

// 向后兼容的导出对象
export const analytics = {
  initAnalytics: (config: AnalyticsConfig) => {
    initAnalytics(config)
  },
  
  trackEvent: (eventName: string, props?: any) => {
    const instance = getAnalytics()
    if (instance) instance.trackEvent(eventName, props)
  },
  
  trackLogin: (userId: string, method?: string) => {
    const instance = getAnalytics()
    if (instance) instance.trackLogin(userId, method)
  },
  
  trackRegistration: (userId: string, method?: string) => {
    const instance = getAnalytics()
    if (instance) instance.trackRegistration(userId, method)
  },
  
  trackVideoPlay: (contentId: string, contentType: string, duration?: number) => {
    const instance = getAnalytics()
    if (instance) instance.trackVideoPlay(contentId, contentType, duration)
  },
  
  trackPurchase: (orderId: string, amount: number, currency: string, method?: string) => {
    const instance = getAnalytics()
    if (instance) instance.trackPurchase(orderId, amount, currency, method)
  },
  
  trackSearch: (query: string, results?: number) => {
    const instance = getAnalytics()
    if (instance) instance.trackSearch(query, results)
  },
  
  trackShare: (contentId: string, contentType: string, platform?: string) => {
    const instance = getAnalytics()
    if (instance) instance.trackShare(contentId, contentType, platform)
  },
  
  getVisitorId: () => {
    const instance = getAnalytics()
    return instance ? instance.getVisitorId() : null
  },
  
  getSessionId: () => {
    const instance = getAnalytics()
    return instance ? instance.getSessionId() : null
  },
  
  setUserId: (userId: string) => {
    const instance = getAnalytics()
    if (instance) instance.setUserId(userId)
  }
}

// 默认导出（向后兼容）
export default analytics
