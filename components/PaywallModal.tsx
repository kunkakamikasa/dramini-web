'use client'

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Lock, Crown, Star, Clock } from 'lucide-react';
import { PaywallModalProps } from '@/types';
import { analytics } from '@/lib/analytics';
import { formatPrice } from '@/lib/utils';
import { startStripeCheckout, startPayPalCheckout } from '@/lib/pay';

export function PaywallModal({ isOpen, onClose, title, episode, onUnlock }: PaywallModalProps) {
  const handleUnlock = (type: 'single' | 'season' | 'vip') => {
    analytics.trackEvent('paywall_open', { titleId: title.id, episode });
    onUnlock?.(type);
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            解锁内容
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold">{title.name}</h3>
            {episode && (
              <p className="text-sm text-gray-600">第 {episode} 集</p>
            )}
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => handleUnlock('single')}
              className="w-full"
            >
              <Crown className="h-4 w-4 mr-2" />
              单集解锁 - ¥2.99
            </Button>
            
            <Button 
              onClick={() => handleUnlock('season')}
              className="w-full"
            >
              <Star className="h-4 w-4 mr-2" />
              整季解锁 - ¥9.99
            </Button>
            
            <Button 
              onClick={() => handleUnlock('vip')}
              className="w-full"
            >
              <Clock className="h-4 w-4 mr-2" />
              VIP会员 - 免费观看
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
