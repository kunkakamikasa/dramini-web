'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Coins, Home } from 'lucide-react'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const orderId = searchParams.get('order_id')
  const token = searchParams.get('token')
  const payerId = searchParams.get('PayerID')
  const [verifying, setVerifying] = useState(true)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      verifyStripePayment(sessionId)
    } else if (orderId) {
      verifyPayPalPayment(orderId)
    } else if (token && payerId) {
      // PayPal 支付成功，需要捕获
      capturePayPalPayment(token)
    } else {
      // PayPal 支付成功但没有 order_id，显示通用成功信息
      setPaymentInfo({
        success: true,
        metadata: {
          coins: 0,
          plan: 'PayPal Payment'
        }
      })
      setVerifying(false)
    }
    
    // 支付成功后刷新用户状态
    if (paymentInfo?.success) {
      // 触发 Header 组件刷新用户状态
      window.dispatchEvent(new Event('storage'))
    }
  }, [sessionId, orderId, token, payerId, paymentInfo?.success])

  const verifyStripePayment = async (sessionId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com/api/v1'}/payment/verify/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
      
      if (!response.ok) {
        throw new Error('Payment verification failed')
      }
      
      const data = await response.json()
      setPaymentInfo(data)
      
      // 支付验证成功后刷新用户状态
      if (data.success) {
        window.dispatchEvent(new Event('storage'))
      }
    } catch (error) {
      console.error('Stripe payment verification failed:', error)
      setError('Payment verification failed')
    } finally {
      setVerifying(false)
    }
  }

  const verifyPayPalPayment = async (orderId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com/api/v1'}/payment/verify/paypal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      })
      
      if (!response.ok) {
        throw new Error('Payment verification failed')
      }
      
      const data = await response.json()
      setPaymentInfo(data)
      
      // 支付验证成功后刷新用户状态
      if (data.success) {
        window.dispatchEvent(new Event('storage'))
      }
    } catch (error) {
      console.error('PayPal payment verification failed:', error)
      setError('Payment verification failed')
    } finally {
      setVerifying(false)
    }
  }

  const capturePayPalPayment = async (token: string) => {
    try {
      console.log('Capturing PayPal payment for token:', token)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com/api/v1'}/user/purchase/capture/paypal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: token }),
      })
      
      if (!response.ok) {
        throw new Error('PayPal capture failed')
      }
      
      const data = await response.json()
      console.log('PayPal capture result:', data)
      
      if (data.success) {
        setPaymentInfo({
          success: true,
          metadata: {
            coins: 0, // 金币会通过webhook添加
            plan: 'PayPal Payment'
          }
        })
      } else {
        throw new Error('PayPal capture was not successful')
      }
    } catch (error) {
      console.error('PayPal capture failed:', error)
      setError('PayPal payment capture failed')
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

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-gray-900 border-gray-700">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-white mb-2">支付验证失败</h1>
            <p className="text-gray-300 mb-6">{error}</p>
            <Link href="/">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                <Home className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 bg-gray-900 border-gray-700">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">支付成功！</h1>
          
                 {paymentInfo?.success && (
                   <div className="space-y-3 mb-6">
                     {sessionId && (
                       <>
                         <div className="flex items-center justify-center gap-2 text-yellow-400">
                           <Coins className="w-5 h-5" />
                           <span className="text-xl font-bold">
                             +{paymentInfo.creditedCoins || 0} 金币
                           </span>
                         </div>
                         <p className="text-gray-300">
                           套餐: {paymentInfo.plan || 'Unknown'}
                         </p>
                         {paymentInfo.balance !== undefined && (
                           <p className="text-sm text-gray-400">
                             当前余额: {paymentInfo.balance} 金币
                           </p>
                         )}
                       </>
                     )}
                     {!sessionId && !orderId && (
                       <div className="text-gray-300">
                         支付已成功处理
                       </div>
                     )}
                   </div>
                 )}
          
                 <div className="space-y-3">
                   <Link href="/profile">
                     <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-black">
                       <Coins className="w-4 h-4 mr-2" />
                       查看我的金币
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

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
