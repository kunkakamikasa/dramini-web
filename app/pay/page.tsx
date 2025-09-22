import { PlanPicker } from '@/components/PlanPicker';
import { paymentPlans } from '@/lib/pay';

export default function PayPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PlanPicker 
          plans={paymentPlans}
          onPlanSelect={(planId) => console.log('Plan selected:', planId)}
          onCheckout={(planId) => console.log('Checkout:', planId)}
        />
      </div>
    </div>
  );
}

