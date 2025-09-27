import { PaymentPlan, PaymentResult } from '@/types';
import { analytics } from './analytics';

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3002/api/v1';

// Payment plans configuration
export const paymentPlans: PaymentPlan[] = [
  {
    id: 'single-episode',
    name: 'Single Episode',
    type: 'single',
    price: 0.99,
    priceCents: 99,
    features: [
      'Watch one episode',
      'HD quality',
      'No ads',
      'Download for offline'
    ]
  },
  {
    id: 'full-season',
    name: 'Full Season',
    type: 'season',
    price: 9.99,
    priceCents: 999,
    features: [
      'Watch entire season',
      'HD quality',
      'No ads',
      'Download for offline',
      'Early access to new episodes'
    ]
  },
  {
    id: 'vip-monthly',
    name: 'VIP Monthly',
    type: 'monthly',
    price: 19.99,
    priceCents: 1999,
    features: [
      'Unlimited access to all content',
      'HD quality',
      'No ads',
      'Download for offline',
      'Early access to new releases',
      'Exclusive VIP content',
      'Cancel anytime'
    ],
    popular: true
  },
  {
    id: 'vip-yearly',
    name: 'VIP Yearly',
    type: 'yearly',
    price: 199.99,
    priceCents: 19999,
    features: [
      'Unlimited access to all content',
      'HD quality',
      'No ads',
      'Download for offline',
      'Early access to new releases',
      'Exclusive VIP content',
      'Save 17% vs monthly',
      'Cancel anytime'
    ]
  }
];

// Stripe integration
export async function startStripeCheckout(payload: { plan: string; priceCents: number; meta?: any }) {
  try {
    analytics.checkoutStart(payload.plan, payload.priceCents);
    
    const response = await fetch(`${API_BASE}/user/purchase/checkout/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Stripe checkout failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // 检查是否有 checkout URL
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    } else if (data.success) {
      // 如果没有 checkout URL 但请求成功，显示成功消息
      alert(`✅ ${data.message || 'Payment initiated successfully!'}\nOrder ID: ${data.orderId || 'N/A'}`);
    } else {
      throw new Error('No checkout URL received from server');
    }
    
  } catch (error) {
    console.error('Stripe checkout error:', error);
    analytics.error('stripe_checkout_failed', error instanceof Error ? error.message : 'Payment failed');
  }
}

// PayPal integration
export async function startPayPalCheckout(payload: { plan: string; priceCents: number; meta?: any }) {
  try {
    analytics.checkoutStart(payload.plan, payload.priceCents);
    
    const response = await fetch(`${API_BASE}/user/purchase/checkout/paypal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`PayPal checkout failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // 检查是否有 checkout URL
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    } else if (data.success) {
      // 如果没有 checkout URL 但请求成功，显示成功消息
      alert(`✅ ${data.message || 'Payment initiated successfully!'}\nOrder ID: ${data.orderId || 'N/A'}`);
    } else {
      throw new Error('No checkout URL received from server');
    }
    
  } catch (error) {
    console.error('PayPal payment error:', error);
    analytics.error('paypal_checkout_failed', error instanceof Error ? error.message : 'Payment failed');
  }
}

// Utility functions
export function getPlanPrice(planId: string): number {
  const plan = paymentPlans.find(p => p.id === planId);
  return plan?.priceCents || 0;
}

export function formatPrice(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}

export function getPlanById(planId: string): PaymentPlan | undefined {
  return paymentPlans.find(p => p.id === planId);
}

// Payment success handler
export async function handlePaymentSuccess(sessionId: string, provider: 'stripe' | 'paypal'): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/user/purchase/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, provider }),
    });

    if (!response.ok) {
      throw new Error(`Payment verification failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Track success event
    analytics.checkoutSuccess('unknown', 0, sessionId);
    
    return data.success || false;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
}

// Payment cancellation handler
export function handlePaymentCancel(planId: string): void {
  analytics.checkoutCancel(planId, getPlanPrice(planId));
}

// Subscription management
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/user/subscription/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      throw new Error(`Subscription cancellation failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.success || false;
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return false;
  }
}

export async function updateSubscription(subscriptionId: string, newPlanId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/user/subscription/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId, newPlanId }),
    });

    if (!response.ok) {
      throw new Error(`Subscription update failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.success || false;
  } catch (error) {
    console.error('Subscription update error:', error);
    return false;
  }
}
