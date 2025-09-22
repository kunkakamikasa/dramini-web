'use client'

import { useState, useEffect } from 'react'
import { PlanPicker } from '@/components/PlanPicker'
import { PaymentPlan } from '@/types'

export default function PayPage() {
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([])

  useEffect(() => {
    // 模拟获取支付计划数据
    setPaymentPlans([
      {
        id: 'basic',
        name: '基础版',
        price: 9.99,
        priceCents: 999,
        features: ['高清画质', '无广告'],
        popular: false,
        type: 'monthly'
      },
      {
        id: 'premium',
        name: '高级版',
        price: 19.99,
        priceCents: 1999,
        features: ['4K画质', '无广告', '离线下载'],
        popular: true,
        type: 'monthly'
      }
    ])
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">选择订阅计划</h1>
      <div className="max-w-4xl mx-auto">
        <PlanPicker 
          plans={paymentPlans}
          onPlanSelect={(planId: string) => console.log('Plan selected:', planId)}
          onCheckout={(planId: string) => console.log('Checkout:', planId)}
        />
      </div>
    </div>
  )
}
