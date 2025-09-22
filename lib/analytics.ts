// 扩展 Window 接口
declare global {
  interface Window {
    dataLayer: any[]
  }
}

import { AnalyticsEvent } from '@/types';

// Analytics event tracking
export function ev(name: string, meta?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    const event: AnalyticsEvent = {
      type: name,
      data: meta,
      timestamp: Date.now()
    };
    window.dataLayer.push(event);
  }
}

// 页面浏览跟踪
export function pageView(path: string, title?: string) {
  ev('page_view', { path, title });
}

// 海报点击跟踪
export function posterClick(titleId: string, index: number, section: string) {
  ev('poster_click', { titleId, index, section });
}

// 海报展示跟踪
export function posterImpression(titleId: string, index: number, section: string) {
  ev('poster_impression', { titleId, index, section });
}

// 分类选择跟踪
export function categorySelect(category: string) {
  ev('category_select', { category });
}

// 英雄区域CTA点击跟踪
export function heroCtaClick(cta: 'watch' | 'app', pos: 'hero') {
  ev('hero_cta_click', { cta, pos });
}

// 支付墙打开跟踪
export function paywallOpen(titleId: string, episode?: number) {
  ev('paywall_open', { titleId, episode });
}

// 结账开始跟踪
export function checkoutStart(planId: string, priceCents: number) {
  ev('checkout_start', { planId, priceCents });
}

// 结账成功跟踪
export function checkoutSuccess(planId: string, priceCents: number, sessionId: string) {
  ev('checkout_success', { planId, priceCents, sessionId });
}

// 结账取消跟踪
export function checkoutCancel(planId: string, priceCents: number) {
  ev('checkout_cancel', { planId, priceCents });
}

// 错误跟踪
export function error(error: string, context?: string) {
  ev('error', { error, context });
}

// 默认导出 analytics 对象
export const analytics = {
  pageView,
  posterClick,
  posterImpression,
  categorySelect,
  heroCtaClick,
  paywallOpen,
  checkoutStart,
  checkoutSuccess,
  checkoutCancel,
  error
};
