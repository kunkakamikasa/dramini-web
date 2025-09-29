'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

export function AnalyticsInit() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 等待Analytics初始化后再发送事件
      setTimeout(() => {
        analytics.trackEvent('page_view', { 
          path: window.location.pathname,
          title: document.title,
          referrer: document.referrer || '',
          timestamp: new Date().toISOString()
        });
        console.log('AnalyticsInit: page_view event sent for', window.location.pathname);
      }, 1000);
    }
  }, []);

  return null;
}
