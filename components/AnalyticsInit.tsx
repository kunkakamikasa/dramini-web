'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

export function AnalyticsInit() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      analytics.trackPageView(window.location.pathname, document.title);
    }
  }, []);

  return null;
}

