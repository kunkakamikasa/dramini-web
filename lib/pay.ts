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
export async function startStripeCheckout(payload: { tierKey: string; userId: string }) {
  try {
    analytics.checkoutStart(payload.tierKey, 0); // priceCents 现在由服务端决定
    
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
      // 重定向到 Stripe Checkout 页面
      window.location.href = data.checkoutUrl;
    } else {
      throw new Error('No checkout URL received from server');
    }
    
  } catch (error) {
    console.error('Stripe checkout error:', error);
    analytics.error('stripe_checkout_failed', error instanceof Error ? error.message : 'Payment failed');
    throw error;
  }
}

// PayPal integration
export async function startPayPalCheckout(payload: { tierKey: string; userId: string }) {
  try {
    analytics.checkoutStart(payload.tierKey, 0); // priceCents 现在由服务端决定
    
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
      // 重定向到 PayPal 支付页面
      window.location.href = data.checkoutUrl;
    } else {
      throw new Error('No checkout URL received from server');
    }
    
  } catch (error) {
    console.error('PayPal payment error:', error);
    analytics.error('paypal_checkout_failed', error instanceof Error ? error.message : 'Payment failed');
    throw error;
  }
}

// 获取金币套餐列表
export async function getPaymentTiers() {
  try {
    const response = await fetch(`${API_BASE}/payment-packages`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch payment packages: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get payment packages error:', error);
    throw error;
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

// Payment verification functions
export async function verifyStripePayment(sessionId: string) {
  try {
    const response = await fetch(`${API_BASE}/payment/verify/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      throw new Error(`Stripe payment verification failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Track success event
    if (data.success) {
      analytics.checkoutSuccess('stripe', 0, sessionId);
    }
    
    return data;
  } catch (error) {
    console.error('Stripe payment verification error:', error);
    throw error;
  }
}

export async function verifyPayPalPayment(orderId: string) {
  try {
    const response = await fetch(`${API_BASE}/payment/verify/paypal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) {
      throw new Error(`PayPal payment verification failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Track success event
    if (data.success) {
      analytics.checkoutSuccess('paypal', 0, orderId);
    }
    
    return data;
  } catch (error) {
    console.error('PayPal payment verification error:', error);
    throw error;
  }
}

// Payment success handler (legacy)
export async function handlePaymentSuccess(sessionId: string, provider: 'stripe' | 'paypal'): Promise<boolean> {
  try {
    if (provider === 'stripe') {
      const data = await verifyStripePayment(sessionId);
      return data.success || false;
    } else if (provider === 'paypal') {
      const data = await verifyPayPalPayment(sessionId);
      return data.success || false;
    }
    return false;
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
