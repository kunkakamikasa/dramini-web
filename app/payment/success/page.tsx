'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Coins, Home } from 'lucide-react'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [verifying, setVerifying] = useState(true)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId)
    }
  }, [sessionId])

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(`http://localhost:3002/api/v1/payment/verify/${sessionId}`)
      const data = await response.json()
      
      setPaymentInfo(data)
    } catch (error) {
      console.error('验证支付失败:', error)
    } finally {
      setVerifying(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-lg">验证支付中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 bg-gray-900 border-gray-700">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">支付成功！</h1>
          
          {paymentInfo?.paid && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <Coins className="w-5 h-5" />
                <span className="text-xl font-bold">+{paymentInfo.coinsAdded} 金币</span>
              </div>
              <p className="text-gray-300">
                购买套餐: {paymentInfo.packageName}
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <Link href="/coins">
              <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-black">
                <Coins className="w-4 h-4 mr-2" />
                查看金币余额
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
