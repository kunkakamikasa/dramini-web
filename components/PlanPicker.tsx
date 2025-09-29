'use client'

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check, Crown, Star, Clock } from 'lucide-react';
import { PlanPickerProps } from '@/types';
import { analytics } from '@/lib/analytics';
import { formatPrice } from '@/lib/utils';

export function PlanPicker({ plans, selectedPlan, onPlanSelect, onCheckout }: PlanPickerProps) {
  const [localSelectedPlan, setLocalSelectedPlan] = useState(selectedPlan);

  const handlePlanSelect = (planId: string) => {
    setLocalSelectedPlan(planId);
    onPlanSelect(planId);
  };

  const handleCheckout = () => {
    if (localSelectedPlan) {
      const plan = plans.find(p => p.id === localSelectedPlan);
      if (plan) {
        analytics.trackEvent('checkout_start', { planId: plan.id, priceCents: plan.priceCents });
        onCheckout(plan.id);
      }
    }
  };

  const getPlanIcon = (type?: string) => {
    switch (type) {
      case 'monthly':
        return <Clock className="h-4 w-4" />;
      case 'yearly':
        return <Crown className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card 
          key={plan.id} 
          className={`relative cursor-pointer transition-all ${
            localSelectedPlan === plan.id 
              ? 'ring-2 ring-primary shadow-lg' 
              : 'hover:shadow-md'
          }`}
          onClick={() => handlePlanSelect(plan.id)}
        >
          {plan.popular && (
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              热门
            </Badge>
          )}
          
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className={`p-3 rounded-full ${
                plan.popular ? 'bg-primary text-primary-foreground' :
                plan.type === 'yearly' ? 'bg-secondary text-background' :
                'bg-muted text-muted-foreground'
              }`}>
                {getPlanIcon(plan.type)}
              </div>
            </div>
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <div className="text-3xl font-bold">
              {formatPrice(plan.price)}
              <span className="text-sm text-muted-foreground">/月</span>
            </div>
          </CardHeader>
          
          <CardContent>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
            
            <Button 
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                handleCheckout();
              }}
            >
              选择计划
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
