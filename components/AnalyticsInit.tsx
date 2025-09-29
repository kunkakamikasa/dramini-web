'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

export function AnalyticsInit() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize analytics with basic tracking
      analytics.trackEvent('page_load', { 
        path: window.location.pathname,
        title: document.title 
      });
    }
  }, []);

  return null;
}
