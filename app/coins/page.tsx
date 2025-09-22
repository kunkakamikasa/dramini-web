'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Coins, CreditCard, Gift, Star, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { fetchApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface PaymentPackage {
  id: string
  name: string
  priceUsd: number
  baseCoins: number
  bonusCoins: number
  totalCoins: number
  isFirstTime: boolean
  description?: string
}

interface UserCoin {
  balance: number
  totalEarned: number
  totalSpent: number
}

export default function CoinsPage() {
  const [packages, setPackages] = useState<PaymentPackage[]>([])
  const [userCoins, setUserCoins] = useState<UserCoin | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
    
    // 检查支付结果
    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get('session_id')
    
    if (sessionId) {
      verifyPayment(sessionId)
    }
  }, [])

  const fetchData = async () => {
    try {
      const [packagesRes, coinsRes] = await Promise.all([
        fetchApi('/payment-packages'),
        fetchApi('/user/demo_user/coins')
      ])
      
      if (packagesRes.ok) {
        setPackages((packagesRes as any).packages || [])
      }
      
      if (coinsRes.ok) {
        setUserCoins(coinsRes.data)
      }
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetchApi(`/payment/verify/${sessionId}`)
      
      if (response.ok && response.paid) {
        toast.success(`支付成功！获得 ${response.coinsAdded} 金币`)
        fetchData() // 刷新余额
        
        // 清理URL参数
        window.history.replaceState({}, '', '/coins')
      }
    } catch (error) {
      console.error('验证支付失败:', error)
    }
  }

  const handlePurchase = async (pkg: PaymentPackage) => {
    setPurchasing(pkg.id)
    
    try {
      const response = await fetchApi('/payment/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          packageId: pkg.id,
          userId: 'demo_user' // 演示用户ID
        })
      })
      
      if (response.ok && response.checkoutUrl) {
        // 跳转到Stripe支付页面
        window.location.href = response.checkoutUrl
      } else {
        throw new Error('创建支付会话失败')
      }
      
    } catch (error) {
      toast.error('启动支付失败')
      setPurchasing(null)
    }
  }

  const handleAdUnlock = async () => {
    try {
      const response = await fetchApi('/user/demo_user/ad-unlock', {
        method: 'POST',
        body: JSON.stringify({ adProvider: 'ADMOB' })
      })
      
      if (response.ok) {
        toast.success(`观看广告获得${response.coinsEarned}金币！剩余${response.remainingAds}次`)
        fetchData()
      } else {
        throw new Error(response.error)
      }
    } catch (error) {
      toast.error('广告解锁失败')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 导航 */}
      <div className="p-4 border-b border-gray-800">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
          <h1 className="text-xl font-bold">金币充值</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* 金币余额 */}
        {userCoins && (
          <Card className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Coins className="w-8 h-8" />
                    {userCoins.balance} 金币
                  </h2>
                  <p className="opacity-90">
                    累计获得: {userCoins.totalEarned} | 累计消费: {userCoins.totalSpent}
                  </p>
                </div>
                <Button 
                  onClick={handleAdUnlock}
                  className="bg-white text-yellow-700 hover:bg-gray-100"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  看广告获得金币
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 充值套餐 */}
        <div>
          <h2 className="text-2xl font-bold mb-4">充值套餐</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`bg-gray-900 border-gray-700 hover:border-yellow-500 transition-colors ${
                  pkg.isFirstTime ? 'ring-2 ring-yellow-500' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{pkg.name}</CardTitle>
                    {pkg.isFirstTime && (
                      <Badge className="bg-yellow-500 text-black">
                        <Star className="w-3 h-3 mr-1" />
                        首充
                      </Badge>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-yellow-400">
                    ${(pkg.priceUsd / 100).toFixed(2)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">基础金币:</span>
                      <span className="text-white">{pkg.baseCoins}</span>
                    </div>
                    {pkg.bonusCoins > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">赠送金币:</span>
                        <span className="text-yellow-400">+{pkg.bonusCoins}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t border-gray-700 pt-2">
                      <span>总计:</span>
                      <span className="text-yellow-400">{pkg.totalCoins} 金币</span>
                    </div>
                  </div>
                  
                  {pkg.description && (
                    <p className="text-xs text-gray-400">{pkg.description}</p>
                  )}
                  
                  <Button 
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
                    onClick={() => handlePurchase(pkg)}
                    disabled={purchasing === pkg.id}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {purchasing === pkg.id ? '跳转支付中...' : '立即购买'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 测试提示 */}
        <Card className="bg-blue-900 border-blue-700">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-100 mb-2">测试环境提示</h3>
            <p className="text-sm text-blue-200 mb-3">
              当前为Stripe测试环境，使用以下测试卡号：
            </p>
            <div className="bg-blue-800 p-3 rounded text-sm text-blue-100">
              <div>卡号: 4242 4242 4242 4242</div>
              <div>过期: 任意未来日期 (如 12/34)</div>
              <div>CVC: 任意3位数字 (如 123)</div>
            </div>
          </CardContent>
        </Card>

        {/* 说明 */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <h3 className="font-semibold text-white mb-2">金币用途</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 单集观看: 100金币/集</li>
              <li>• 整部剧购买: 1200-2800金币 (更优惠)</li>
              <li>• 看广告获得: 30金币/次 (每日限5次)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}