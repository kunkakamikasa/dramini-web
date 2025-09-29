'use client'

import { v4 as uuidv4 } from 'uuid'

// Types
interface AnalyticsConfig {
  domain: string
  endpoint: string
  batchSize?: number
  flushInterval?: number
  sessionTimeout?: number  // 30分钟
  heartbeatInterval?: number  // 15秒
}

interface AnalyticsEvent {
  event_id: string
  event_name: string
  visitor_id: string
  session_id: string
  user_id?: string
  schema_version: number
  props: Record<string, any>
  timestamp: string
}

interface PageViewEvent extends AnalyticsEvent {
  page_view_id?: string
  page: string
  title?: string
  referrer?: string
  duration_seconds?: number
}

interface QueueItem {
  type: 'event' | 'pageview' | 'heartbeat'
  data: AnalyticsEvent | PageViewEvent | { page_view_id: string; seconds: number }
}

class AnalyticsSDK {
  private config: AnalyticsConfig
  private eventQueue: QueueItem[] = []
  private flushTimer?: NodeJS.Timeout
  private heartbeatTimer?: NodeJS.Timeout
  private pageViewId?: string
  private sessionStartTime: number = Date.now()
  private lastActivityTime: number = Date.now()
  private isVisible: boolean = true
  private currentDuration: number = 0

  constructor(config: AnalyticsConfig) {
    this.config = {
      batchSize: 10,
      flushInterval: 2000,
      sessionTimeout: 30 * 60 * 1000, // 30分钟
      heartbeatInterval: 15 * 1000, // 15秒
      ...config
    }
    
    this.init()
  }

  private init() {
    if (typeof window === 'undefined') return

    // 设置可见性监听
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden
      if (document.hidden) {
        this.flushQueue('visibilitychange')
      }
    })

    // 页面卸载时冲刷队列
    window.addEventListener('beforeunload', () => {
      this.flushQueue('beforeunload')
    })

    // 监听会话超时
    this.startSessionWatcher()

    // 监听页面点击和滚动活动
    document.addEventListener('click', () => this.updateActivity())
    document.addEventListener('scroll', () => this.updateActivity())
    document.addEventListener('keypress', () => this.updateActivity())
  }

  // 获取或创建访客ID（持久化）
  getVisitorId(): string {
    const storageKey = 'analytics_visitor_id'
    
    try {
      let visitorId = localStorage.getItem(storageKey)
      
      if (!visitorId) {
        visitorId = uuidv4()
        // 优先localStorage，失败回退到Cookie（1年）
        try {
          localStorage.setItem(storageKey, visitorId)
        } catch (e) {
          this.setCookie(storageKey, visitorId, 365) // 1年
        }
      }
      
      return visitorId
    } catch (e) {
      // 极端情况回退到Cookie
      const cookieId = this.getCookie(storageKey)
      if (!cookieId) {
        const newId = uuidv4()
        this.setCookie(storageKey, newId, 365)
        return newId
      }
      return cookieId
    }
  }

  // 获取或创建会话ID（30分钟滚动会话）
  getSessionId(): string {
    const storageKey = 'analytics_session_id'
    const lastActivityKey = 'analytics_session_last_ts'
    
    try {
      const lastActivity = localStorage.getItem(lastActivityKey)
      const now = Date.now()
      
      // 检查是否超时（30分钟）
      if (!lastActivity || (now - parseInt(lastActivity)) > this.config.sessionTimeout!) {
        const newSessionId = uuidv4()
        localStorage.setItem(storageKey, newSessionId)
        localStorage.setItem(lastActivityKey, now.toString())
        this.sessionStartTime = now
        return newSessionId
      }
      
      // 更新活动时间
      localStorage.setItem(lastActivityKey, now.toString())
      return localStorage.getItem(storageKey) || uuidv4()
    } catch (e) {
      return uuidv4()
    }
  }

  // 跨标签页会话同步
  private setupCrossTabSync() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'analytics_session_id') {
        this.sessionStartTime = Date.now()
      }
    })

    // BroadcastChannel支持（更现代的方式）
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('analytics_session')
      channel.addEventListener('message', (e) => {
        if (e.data.type === 'session_update') {
          this.sessionStartTime = Date.now()
        }
      })
    }
  }

  // Cookie辅助方法
  private setCookie(name: string, value: string, days: number) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
  }

  // 更新用户活动时间
  private updateActivity() {
    this.lastActivityTime = Date.now()
  }

  // 启动会话超时监听
  private startSessionWatcher() {
    setInterval(() => {
      const now = Date.now()
      const timeSinceActivity = now - this.lastActivityTime
      
      if (timeSinceActivity > this.config.sessionTimeout!) {
        // 会话超时，创建新会话
        const newSessionId = this.getSessionId()
        this.trackEvent('session_timeout', { 
          previous_session_duration: now - this.sessionStartTime 
        })
        this.sessionStartTime = now
      }
    }, 60000) // 每分钟检查一次
  }

  // 发送心跳
  private startPageViewHeartbeat(pageViewId: string) {
    const startTime = Date.now()
    
    this.heartbeatTimer = setInterval(() => {
      const duration = this.isVisible 
        ? Math.floor((Date.now() - startTime) / 1000)
        : this.currentDuration

      if (duration > this.currentDuration) {
        const delta = duration - this.currentDuration
        this.currentDuration = duration
        
        this.queueData({
          type: 'heartbeat',
          data: { page_view_id: pageViewId, seconds: delta }
        })
      }
    }, this.config.heartbeatInterval)
  }

  private stopPageViewHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = undefined
    }
  }

  // 队列管理
  private queueData(item: QueueItem) {
    this.eventQueue.push(item)
    
    // 批量发送或立即刷新
    if (this.eventQueue.length >= this.config.batchSize!) {
      this.flushQueue('batch_full')
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushQueue('timer')
      }, this.config.flushInterval)
    }
  }

  // 冲刷队列
  private flushQueue(reason: string) {
    if (this.eventQueue.length === 0) return

    const events = [...this.eventQueue]
    this.eventQueue = []
    
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = undefined
    }

    this.sendEvents(events, reason)
  }

  // 发送事件到后端
  private async sendEvents(events: QueueItem[], reason: string) {
    if (!events.length) return

    try {
      // 使用sendBeacon作为兜底方案
      const useSendBeacon = reason === 'beforeunload' || reason === 'visibilitychange'
      
      if (useSendBeacon && 'sendBeacon' in navigator) {
        const success = navigator.sendBeacon(
          this.config.endpoint,
          JSON.stringify({ events, reason })
        )
        if (!success) {
          throw new Error('sendBeacon failed')
        }
      } else {
        const response = await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Analytics-Key': 'web-client', // 验证来源
            'Origin': this.config.domain
          },
          body: JSON.stringify({ events, reason }),
          keepalive: true // 页面卸载时也能发送
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
      }
    } catch (error) {
      console.warn('Analytics send failed:', error)
      // 重试逻辑：将失败的event放回队列
      this.eventQueue.unshift(...events)
    }
  }

  // 基础事件记录
  trackEvent(eventName: string, props: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      event_id: uuidv4(),
      event_name: eventName,
      visitor_id: this.getVisitorId(),
      session_id: this.getSessionId(),
      user_id: typeof window !== 'undefined' ? localStorage.getItem('userId') || undefined : undefined,
      schema_version: 1,
      props,
      timestamp: new Date().toISOString()
    }

    this.queueData({
      type: 'event',
      data: event
    })

    return event.event_id
  }

  // 页面访问记录
  trackPageView(path: string, title?: string, referrer?: string): { pageViewId: string } {
    // 防重复：同一路径2秒内只记录一次
    const pathKey = `last_pv_${path}`
    const now = Date.now()
    const lastPV = localStorage.getItem(pathKey)
    
    if (lastPV && (now - parseInt(lastPV)) < 2000) {
      return { pageViewId: this.pageViewId || '' }
    }
    
    localStorage.setItem(pathKey, now.toString())

    const pageViewId = uuidv4()
    
    // 清理之前的心跳
    this.stopPageViewHeartbeat()
    
    const pageViewEvent: PageViewEvent = {
      event_id: uuidv4(),
      event_name: 'page_view',
      visitor_id: this.getVisitorId(),
      session_id: this.getSessionId(),
      user_id: typeof window !== 'undefined' ? localStorage.getItem('userId') || undefined : undefined,
      schema_version: 1,
      props: {},
      timestamp: new Date().toISOString(),
      page_view_id: pageViewId,
      page: path,
      title,
      referrer: referrer || document.referrer
    }

    this.pageViewId = pageViewId
    this.currentDuration = 0

    this.queueData({
      type: 'pageview',
      data: pageViewEvent
    })

    // 开始心跳
    this.startPageViewHeartbeat(pageViewId)

    return { pageViewId }
  }

  // 会话开始
  trackSession() {
    const sessionId = this.getSessionId()
    this.trackEvent('session_start', {
      session_duration: 0,
      session_id: sessionId
    })
  }

  // 设置用户ID（登录后绑定）
  setUserId(userId: string) {
    this.trackEvent('user_set', { user_id: userId })
  }

  // 业务方法映射
  trackVideoPlay(videoId: string, title: string, duration?: number) {
    return this.trackEvent('video_play', { videoId, title, duration })
  }

  trackRegistration(userId: string, email: string) {
    return this.trackEvent('user_register', { user_id: userId, email })
  }

  trackLogin(userId: string, email: string) {
    this.setUserId(userId)
    return this.trackEvent('user_login', { user_id: userId, email })
  }

  trackPurchase(orderId: string, amount: number, currency: string, method: string) {
    return this.trackEvent('purchase', { 
      order_id: orderId, 
      amount, 
      currency, 
      payment_method: method 
    })
  }

  trackSearch(query: string, results?: number) {
    return this.trackEvent('search', { query: query, results })
  }

  trackShare(contentId: string, contentType: string, platform?: string) {
    return this.trackEvent('share', { content_id: contentId, content_type: contentType, platform })
  }
}

// 全局实例
let analyticsInstance: AnalyticsSDK | null = null

// 初始化函数
export function initAnalytics(config: AnalyticsConfig): AnalyticsSDK {
  if (analyticsInstance) {
    console.warn('Analytics already initialized')
    return analyticsInstance
  }
  
  analyticsInstance = new AnalyticsSDK(config)
  return analyticsInstance
}

// 获取实例
export function getAnalytics(): AnalyticsSDK | null {
  return analyticsInstance
}

// 默认导出保持兼容
export default {
  init: initAnalytics,
  get: getAnalytics,
  
  // 便利方法（如果没有初始化则自动初始化）
  trackEvent: (name: string, props?: any) => {
    const analytics = getAnalytics()
    if (!analytics) {
      console.warn('Analytics not initialized')
      return
    }
    return analytics.trackEvent(name, props)
  },
  
  trackPageView: (path: string, title?: string) => {
    const analytics = getAnalytics()
    if (!analytics) {
      console.warn('Analytics not initialized')
      return { pageViewId: '' }
    }
    return analytics.trackPageView(path, title)
  },
  
  trackVideoPlay: (videoId: string, title: string, duration?: number) => {
    const analytics = getAnalytics()
    if (!analytics) {
      console.warn('Analytics not initialized')
      return
    }
    return analytics.trackVideoPlay(videoId, title, duration)
  },
  
  trackRegistration: (userId: string, email: string) => {
    const analytics = getAnalytics()
    if (!analytics) {
      console.warn('Analytics not initialized')
      return
    }
    return analytics.trackRegistration(userId, email)
  },
  
  trackLogin: (userId: string, email: string) => {
    const analytics = getAnalytics()
    if (!analytics) {
      console.warn('Analytics not initialized')
      return
    }
    return analytics.trackLogin(userId, email)
  },
  
  trackPurchase: (orderId: string, amount: number, currency: string, method: string) => {
    const analytics = getAnalytics()
    if (!analytics) {
      console.warn('Analytics not initialized')
      return
    }
    return analytics.trackPurchase(orderId, amount, currency, method)
  },
  
  trackSearch: (query: string, results?: number) => {
    const analytics = getAnalytics()
    if (!analytics) {
      console.warn('Analytics not initialized')
      return
    }
    return analytics.trackSearch(query, results)
  },
  
  trackShare: (contentId: string, contentType: string, platform?: string) => {
    const analytics = getAnalytics()
    if (!analytics) {
      console.warn('Analytics not initialized')
      return
    }
    return analytics.trackShare(contentId, contentType, platform)
  }
}