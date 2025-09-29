'use client'

interface AnalyticsData {
  sessionId?: string
  userId?: string
  page?: string
  title?: string
  referrer?: string
  eventType?: string
  eventData?: any
}

class Analytics {
  private sessionId: string
  private userId: string | null = null
  private apiBase: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com/api/v1'
    
    // 从localStorage获取用户ID
    if (typeof window !== 'undefined') {
      this.userId = localStorage.getItem('userId')
    }

    // 监听登录状态变化
    this.setupAuthListener()
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private setupAuthListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'userId') {
          this.userId = e.newValue
        }
      })
    }
  }

  private async sendAnalytics(data: AnalyticsData) {
    try {
      const payload = {
        sessionId: this.sessionId,
        userId: this.userId,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        ...data
      }

      await fetch(`${this.apiBase}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
    } catch (error) {
      console.error('Analytics send error:', error)
    }
  }

  // 页面访问埋点
  trackPageView(page: string, title?: string) {
    this.sendAnalytics({
      page,
      title: title || document.title
    })
  }

  // 用户事件埋点
  trackEvent(eventType: string, eventData?: any) {
    this.sendAnalytics({
      eventType,
      eventData
    })
  }

  // 视频播放埋点
  trackVideoPlay(videoId: string, title: string, duration?: number) {
    this.sendAnalytics({
      eventType: 'video_play',
      eventData: {
        videoId,
        title,
        duration,
        timestamp: new Date().toISOString()
      }
    })
  }

  // 用户注册埋点
  trackRegistration(userId: string, email: string) {
    this.sendAnalytics({
      eventType: 'register',
      eventData: {
        userId,
        email,
        timestamp: new Date().toISOString()
      }
    })
  }

  // 用户登录埋点
  trackLogin(userId: string, email: string) {
    this.sendAnalytics({
      eventType: 'login',
      eventData: {
        userId,
        email,
        timestamp: new Date().toISOString()
      }
    })
  }

  // 支付埋点
  trackPurchase(orderId: string, amount: number, currency: string, method: string) {
    this.sendAnalytics({
      eventType: 'purchase',
      eventData: {
        orderId,
        amount,
        currency,
        method,
        timestamp: new Date().toISOString()
      }
    })
  }

  // 搜索埋点
  trackSearch(query: string, results?: number) {
    this.sendAnalytics({
      eventType: 'search',
      eventData: {
        query,
        results,
        timestamp: new Date().toISOString()
      }
    })
  }

  // 分享埋点
  trackShare(contentId: string, contentType: string, platform?: string) {
    this.sendAnalytics({
      eventType: 'share',
      eventData: {
        contentId,
        contentType,
        platform,
        timestamp: new Date().toISOString()
      }
    })
  }
}

// 创建全局分析实例
const analytics = new Analytics()

export default analytics