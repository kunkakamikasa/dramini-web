'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Lock, Crown, Star, Clock } from 'lucide-react';
import { PaywallModalProps } from '@/types';
import { analytics } from '@/lib/analytics';
import { formatPrice } from '@/lib/utils';
import { startStripeCheckout, startPayPalCheckout } from '@/lib/pay';

export function PaywallModal({ isOpen, onClose, title, episode, onUnlock }: PaywallModalProps) {
  const handleUnlock = (type: 'single' | 'season' | 'vip') => {
    analytics.paywallOpen(title.id, episode);
    onUnlock(type);
  };

  const handleClose = () => {
    analytics.paywallClose(title.id, episode);
    onClose();
  };

  const episodeInfo = episode ? title.episodes.find(ep => ep.ep === episode) : null;
  const lockedEpisodes = title.episodes.filter(ep => ep.locked);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Unlock Content
          </DialogTitle>
          <DialogDescription>
            {episode ? `Episode ${episode}: ${episodeInfo?.title}` : `Continue watching ${title.title}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Show Info */}
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">{title.title}</h3>
            <div className="flex justify-center gap-2 mb-2">
              {title.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{title.description}</p>
          </div>

          {/* Unlock Options */}
          <div className="space-y-3">
            {/* Single Episode */}
            {episode && episodeInfo && (
              <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="font-medium">Single Episode</span>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(episodeInfo.priceCents || 299)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Watch Episode {episode}: {episodeInfo.title}
                </p>
                
                {/* Payment Methods */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button 
                    className="rounded-xl bg-black text-white border border-white/20 px-4 py-3 hover:bg-gray-800 transition-colors"
                    onClick={() => {
                      startStripeCheckout({ 
                        plan: 'single-episode', 
                        priceCents: episodeInfo.priceCents || 299, 
                        meta: { titleId: title.id, episode } 
                      });
                    }}
                    data-ev="checkout_start" 
                    data-meta={JSON.stringify({ provider: 'stripe', plan: 'single-episode', price: episodeInfo.priceCents || 299 })}
                  >
                    <div className="text-center">
                      <div className="font-semibold">Pay with Stripe</div>
                      <div className="text-xs text-gray-300">Credit Card</div>
                    </div>
                  </button>
                  <button 
                    className="rounded-xl bg-white text-black px-4 py-3 hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      startPayPalCheckout({ 
                        plan: 'single-episode', 
                        priceCents: episodeInfo.priceCents || 299, 
                        meta: { titleId: title.id, episode } 
                      });
                    }}
                    data-ev="checkout_start" 
                    data-meta={JSON.stringify({ provider: 'paypal', plan: 'single-episode', price: episodeInfo.priceCents || 299 })}
                  >
                    <div className="text-center">
                      <div className="font-semibold">Pay with PayPal</div>
                      <div className="text-xs text-gray-600">PayPal Account</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Full Season */}
            <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">Full Season</span>
                </div>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(999)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Watch all {lockedEpisodes.length} remaining episodes
              </p>
              
              {/* Payment Methods */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button 
                  className="rounded-xl bg-black text-white border border-white/20 px-4 py-3 hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    startStripeCheckout({ 
                      plan: 'full-season', 
                      priceCents: 999, 
                      meta: { titleId: title.id } 
                    });
                  }}
                  data-ev="checkout_start" 
                  data-meta={JSON.stringify({ provider: 'stripe', plan: 'full-season', price: 999 })}
                >
                  <div className="text-center">
                    <div className="font-semibold">Pay with Stripe</div>
                    <div className="text-xs text-gray-300">Credit Card</div>
                  </div>
                </button>
                <button 
                  className="rounded-xl bg-white text-black px-4 py-3 hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    startPayPalCheckout({ 
                      plan: 'full-season', 
                      priceCents: 999, 
                      meta: { titleId: title.id } 
                    });
                  }}
                  data-ev="checkout_start" 
                  data-meta={JSON.stringify({ provider: 'paypal', plan: 'full-season', price: 999 })}
                >
                  <div className="text-center">
                    <div className="font-semibold">Pay with PayPal</div>
                    <div className="text-xs text-gray-600">PayPal Account</div>
                  </div>
                </button>
              </div>
            </div>

            {/* VIP Subscription */}
            <div className="border-2 border-primary rounded-lg p-4 bg-primary/5 hover:bg-primary/10 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-secondary" />
                  <span className="font-medium">VIP Monthly</span>
                  <Badge className="bg-secondary text-background">POPULAR</Badge>
                </div>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(1999)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Unlimited access to all content + exclusive VIP shows
              </p>
              
              {/* Payment Methods */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button 
                  className="rounded-xl bg-black text-white border border-white/20 px-4 py-3 hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    startStripeCheckout({ 
                      plan: 'vip-monthly', 
                      priceCents: 1999, 
                      meta: { titleId: title.id } 
                    });
                  }}
                  data-ev="checkout_start" 
                  data-meta={JSON.stringify({ provider: 'stripe', plan: 'vip-monthly', price: 1999 })}
                >
                  <div className="text-center">
                    <div className="font-semibold">Pay with Stripe</div>
                    <div className="text-xs text-gray-300">Credit Card</div>
                  </div>
                </button>
                <button 
                  className="rounded-xl bg-white text-black px-4 py-3 hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    startPayPalCheckout({ 
                      plan: 'vip-monthly', 
                      priceCents: 1999, 
                      meta: { titleId: title.id } 
                    });
                  }}
                  data-ev="checkout_start" 
                  data-meta={JSON.stringify({ provider: 'paypal', plan: 'vip-monthly', price: 1999 })}
                >
                  <div className="text-center">
                    <div className="font-semibold">Pay with PayPal</div>
                    <div className="text-xs text-gray-600">PayPal Account</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-card rounded-lg p-4">
            <h4 className="font-medium mb-2">What you get:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• HD quality streaming</li>
              <li>• No advertisements</li>
              <li>• Download for offline viewing</li>
              <li>• Early access to new episodes</li>
              {title.isVip && <li>• Exclusive VIP content</li>}
            </ul>
          </div>

          {/* Close Button */}
          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={handleClose}
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
