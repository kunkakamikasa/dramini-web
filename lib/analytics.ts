import { AnalyticsEvent } from '@/types';

// Analytics event tracking
export function ev(name: string, meta?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    const event: AnalyticsEvent = {
      event: name,
      ...meta
    };
    window.dataLayer.push(event);
  }
  
  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', name, meta);
  }
}

// Predefined event functions
export const analytics = {
  // Hero section events
  heroCtaClick: (cta: 'watch' | 'app', pos: 'hero') => {
    ev('hero_cta_click', { cta, pos });
  },

  // Poster events
  posterImpression: (titleId: string, index: number, section: string) => {
    ev('poster_impression', { titleId, index, section });
  },

  posterClick: (titleId: string, index: number, section: string) => {
    ev('poster_click', { titleId, index, section });
  },

  // Category events
  categorySelect: (category: string) => {
    ev('category_select', { category });
  },

  // Paywall events
  paywallOpen: (titleId: string, ep?: number) => {
    ev('paywall_open', { titleId, ep });
  },

  paywallClose: (titleId: string, ep?: number) => {
    ev('paywall_close', { titleId, ep });
  },

  // Payment events
  checkoutStart: (plan: string, price: number) => {
    ev('checkout_start', { plan, price });
  },

  checkoutSuccess: (plan: string, price: number, paymentId?: string) => {
    ev('checkout_success', { plan, price, paymentId });
  },

  checkoutCancel: (plan: string, price: number) => {
    ev('checkout_cancel', { plan, price });
  },

  // Player events
  playerPlay: (titleId: string, ep: number) => {
    ev('player_play', { titleId, ep });
  },

  playerPause: (titleId: string, ep: number, progressSec: number) => {
    ev('player_pause', { titleId, ep, progressSec });
  },

  playerNextEp: (titleId: string, ep: number) => {
    ev('player_next_ep', { titleId, ep });
  },

  playerComplete: (titleId: string, ep: number) => {
    ev('player_complete', { titleId, ep });
  },

  // Search events
  searchQuery: (query: string, results: number) => {
    ev('search_query', { query, results });
  },

  searchResultClick: (query: string, titleId: string, position: number) => {
    ev('search_result_click', { query, titleId, position });
  },

  // User events
  userSignUp: (method: 'email' | 'google' | 'apple' | 'facebook') => {
    ev('user_sign_up', { method });
  },

  userSignIn: (method: 'email' | 'google' | 'apple' | 'facebook') => {
    ev('user_sign_in', { method });
  },

  userSignOut: () => {
    ev('user_sign_out');
  },

  // Navigation events
  pageView: (path: string, title?: string) => {
    ev('page_view', { path, title });
  },

  // Error events
  error: (error: string, context?: string) => {
    ev('error', { error, context });
  }
};

// Initialize analytics (call this in your app)
export function initAnalytics() {
  if (typeof window !== 'undefined') {
    // Initialize dataLayer if it doesn't exist
    if (!window.dataLayer) {
      window.dataLayer = [];
    }
    
    // Track initial page view
    analytics.pageView(window.location.pathname, document.title);
  }
}

// Track page changes (for SPA navigation)
export function trackPageChange(path: string, title?: string) {
  analytics.pageView(path, title);
}

// Utility function to add data attributes to elements
export function addAnalyticsData(element: HTMLElement, eventName: string, meta?: Record<string, any>) {
  element.setAttribute('data-ev', eventName);
  if (meta) {
    element.setAttribute('data-meta', JSON.stringify(meta));
  }
}

// Hook for React components to easily add analytics
export function useAnalytics() {
  const trackEvent = (eventName: string, meta?: Record<string, any>) => {
    ev(eventName, meta);
  };

  const addEventData = (element: HTMLElement, eventName: string, meta?: Record<string, any>) => {
    addAnalyticsData(element, eventName, meta);
  };

  return { trackEvent, addEventData };
}

