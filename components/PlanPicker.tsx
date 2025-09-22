'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
        analytics.checkoutStart(plan.id, plan.priceCents);
        onCheckout(plan.id);
      }
    }
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'single':
        return <Star className="h-5 w-5" />;
      case 'season':
        return <Clock className="h-5 w-5" />;
      case 'monthly':
      case 'yearly':
        return <Crown className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const getPlanColor = (plan: any) => {
    if (plan.popular) {
      return 'border-primary bg-primary/5';
    }
    if (plan.type === 'yearly') {
      return 'border-secondary bg-secondary/5';
    }
    return 'border-border bg-card';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-muted-foreground text-lg">
          Unlock unlimited entertainment with flexible options
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
              localSelectedPlan === plan.id ? 'ring-2 ring-primary' : ''
            } ${getPlanColor(plan)}`}
            onClick={() => handlePlanSelect(plan.id)}
          >
            <CardHeader className="text-center pb-4">
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
              {plan.popular && (
                <Badge className="bg-primary text-primary-foreground mx-auto">
                  Most Popular
                </Badge>
              )}
              <div className="text-3xl font-bold text-primary mt-2">
                {formatPrice(plan.priceCents)}
                {plan.type === 'yearly' && (
                  <span className="text-sm text-muted-foreground font-normal">/year</span>
                )}
                {plan.type === 'monthly' && (
                  <span className="text-sm text-muted-foreground font-normal">/month</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Plan Summary */}
      {localSelectedPlan && (
        <div className="bg-card rounded-lg p-6 border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                {plans.find(p => p.id === localSelectedPlan)?.name}
              </h3>
              <p className="text-muted-foreground">
                {plans.find(p => p.id === localSelectedPlan)?.type === 'single' ? 'One-time purchase' :
                 plans.find(p => p.id === localSelectedPlan)?.type === 'season' ? 'One-time purchase' :
                 'Recurring subscription'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatPrice(plans.find(p => p.id === localSelectedPlan)?.priceCents || 0)}
              </div>
              {plans.find(p => p.id === localSelectedPlan)?.type === 'yearly' && (
                <div className="text-sm text-green-500">
                  Save 17% vs monthly
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              className="flex-1"
              onClick={handleCheckout}
            >
              Continue to Payment
            </Button>
            <Button 
              variant="outline"
              onClick={() => setLocalSelectedPlan('')}
            >
              Change Plan
            </Button>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">Secure payment powered by</p>
        <div className="flex justify-center gap-4">
          <div className="bg-white rounded px-3 py-2 text-black font-semibold">
            Stripe
          </div>
          <div className="bg-blue-600 rounded px-3 py-2 text-white font-semibold">
            PayPal
          </div>
        </div>
      </div>
    </div>
  );
}

