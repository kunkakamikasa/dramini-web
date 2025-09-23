'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  X, CreditCard, Coins, Gift, Zap
} from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  episode: {
    id: string
    episodeNum: number
    name?: string
    priceCoins: number
  }
  title: {
    id: string
    name: string
    seriesPriceCoins: number
    totalEpisodes: number
  }
  userCoins: number
  onPaymentSuccess: () => void
}

interface CoinPackage {
  id: string
  name: string
  coins: number
  bonus: number
  price: number
  discount?: string | null
  isNewUser?: boolean
  description?: string
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  episode, 
  title, 
  userCoins,
  onPaymentSuccess 
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card'>('paypal')
  const [coinPackages, setCoinPackages] = useState<CoinPackage[]>([])
  const [loadingPackages, setLoadingPackages] = useState(true)
  const [purchaseType, setPurchaseType] = useState<'episode' | 'series'>('episode')
  
  // 计算用户已付金币数（这里先用模拟数据，实际应该从API获取）
  const userPaidCoins = 0 // TODO: 从API获取用户对本剧已付的金币数
  
  // 计算剩余全部需要的金币
  const remainingSeriesCoins = Math.max(0, title.seriesPriceCoins - userPaidCoins)
  
  // 当前选择的价格
  const currentPrice = purchaseType === 'episode' ? episode.priceCoins : remainingSeriesCoins

  // 获取充值套餐数据
  useEffect(() => {
    if (isOpen) {
      fetchPaymentPackages()
    }
  }, [isOpen])

  const fetchPaymentPackages = async () => {
    try {
      setLoadingPackages(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3002/api/v1'}/payment-packages`)
      const data = await response.json()
      
      if (data.ok && data.packages) {
        setCoinPackages(data.packages)
      } else {
        // 使用默认数据作为后备
        setCoinPackages([
          {
            id: 'default1',
            name: '入门档',
            coins: 500,
            bonus: 50,
            price: 4.99,
            discount: '+10%',
            isNewUser: false,
            description: '新手推荐'
          }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch payment packages:', error)
      // 使用默认数据
      setCoinPackages([])
    } finally {
      setLoadingPackages(false)
    }
  }

  const handlePayment = async () => {
    if (!selectedPackage) {
      alert('Please select a coin package first')
      return
    }

    setLoading(true)
    try {
      // 模拟支付流程
      const purchaseText = purchaseType === 'episode' 
        ? `单集第${episode.episodeNum}集 - ${episode.priceCoins}金币`
        : `剩余全部集数 - ${remainingSeriesCoins}金币`
      
      alert(`🚀 Redirecting to ${paymentMethod} payment...\n💰 购买内容: ${purchaseText}\n💳 充值套餐: ${selectedPackage.coins} Coins + ${selectedPackage.bonus} Bonus\n💵 Price: $${selectedPackage.price}`)
      onPaymentSuccess()
      onClose()
    } catch (error) {
      alert('Payment error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden bg-gray-900 border-gray-700 text-white">
        <CardHeader className="pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-xl">Unlock subsequent episodes</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 overflow-y-auto flex-1" style={{maxHeight: 'calc(90vh - 180px)'}}>
          {/* 顶部：价格选择 */}
          <div className="space-y-4">
            <div className="text-center text-gray-400 text-sm">选择购买方式</div>
            
            {/* 单集购买选项 */}
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                purchaseType === 'episode' 
                  ? 'border-red-500 bg-red-500/10' 
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }`}
              onClick={() => setPurchaseType('episode')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">本集：第{episode.episodeNum}集</div>
                  <div className="text-gray-400 text-sm">单集解锁</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">{episode.priceCoins}</div>
                  <div className="text-gray-400 text-sm">金币</div>
                </div>
              </div>
            </div>

            {/* 剩余全部购买选项 */}
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                purchaseType === 'series' 
                  ? 'border-red-500 bg-red-500/10' 
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }`}
              onClick={() => setPurchaseType('series')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">剩余全部</div>
                  <div className="text-gray-400 text-sm">解锁第{episode.episodeNum}集及以后所有集</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">{remainingSeriesCoins}</div>
                  <div className="text-gray-400 text-sm">金币</div>
                  {remainingSeriesCoins < title.seriesPriceCoins && (
                    <div className="text-green-400 text-xs">已优惠 {title.seriesPriceCoins - remainingSeriesCoins} 金币</div>
                  )}
                </div>
              </div>
            </div>

            {/* 当前选择的价格显示 */}
            <div className="text-center space-y-2 bg-blue-900/20 rounded-lg p-3">
              <div className="text-lg font-semibold text-gray-300">
                {purchaseType === 'episode' ? '本集' : '剩余全部'}：{currentPrice} 金币
              </div>
              <div className="text-gray-400">
                金币余额：{userCoins} 金币 | 0 奖励金币
              </div>
              {userCoins < currentPrice && (
                <div className="text-red-400 text-sm">
                  金币不足，还需 {currentPrice - userCoins} 金币
                </div>
              )}
            </div>
          </div>

          {/* 中间：充值套餐 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">充值金币</h3>
              <Button variant="ghost" size="sm" className="text-red-500">›</Button>
            </div>

            {loadingPackages ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading packages...</div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 新用户特惠包 */}
                {coinPackages.filter(pkg => pkg.isNewUser).map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-4 relative overflow-hidden cursor-pointer border-2 ${
                      selectedPackage?.id === pkg.id ? 'border-yellow-400 ring-2 ring-yellow-400/50' : 'border-transparent'
                    } transition-all hover:scale-[1.02]`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-yellow-500 text-black font-bold">
                        <Zap className="w-3 h-3 mr-1" />
                        {pkg.discount}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Coins className="w-8 h-8 text-yellow-400" />
                        <div>
                          <div className="text-sm opacity-90">NEW USER ONLY</div>
                          <div className="text-2xl font-bold">{pkg.coins}<span className="text-lg">Coins</span></div>
                          <div className="text-sm">+{pkg.bonus} Bonus</div>
                        </div>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="text-2xl font-bold">${pkg.price}</div>
                        <div className="text-sm opacity-75">{pkg.description}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 普通套餐网格 */}
                <div className="grid grid-cols-3 gap-3">
                  {coinPackages.filter(pkg => !pkg.isNewUser).map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`bg-gray-700 rounded-lg p-3 text-center relative cursor-pointer border-2 ${
                        selectedPackage?.id === pkg.id ? 'border-yellow-400 ring-2 ring-yellow-400/50' : 'border-transparent'
                      } transition-all hover:scale-105`}
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      {pkg.discount && (
                        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs">
                          {pkg.discount}
                        </Badge>
                      )}
                      <div className={pkg.discount ? 'mt-2' : ''}>
                        <div className="text-lg font-bold">{pkg.coins}</div>
                        {pkg.bonus > 0 ? (
                          <div className="text-xs">+{pkg.bonus} Bonus</div>
                        ) : (
                          <div className="text-xs text-gray-400">Coins</div>
                        )}
                        <div className="text-sm font-semibold mt-2">${pkg.price}</div>
                        <div className="text-xs text-gray-400 mt-1">{pkg.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 底部：支付方式 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Payment Method</h3>
            <div className="flex gap-3">
              <div 
                className={`flex-1 border-2 rounded-lg p-3 cursor-pointer transition-all ${
                  paymentMethod === 'paypal' ? 'border-red-500 bg-red-500/10' : 'border-gray-600 bg-gray-800'
                }`}
                onClick={() => setPaymentMethod('paypal')}
              >
                <div className="flex items-center justify-center">
                  <div className="bg-blue-600 rounded px-3 py-2 text-white text-sm font-bold">
                    PayPal
                  </div>
                </div>
              </div>
              <div 
                className={`flex-1 border-2 rounded-lg p-3 cursor-pointer transition-all ${
                  paymentMethod === 'card' ? 'border-red-500 bg-red-500/10' : 'border-gray-600 bg-gray-800'
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-gray-400 mr-2" />
                  <span className="text-gray-400 text-sm">Credit Card</span>
                </div>
              </div>
            </div>
          </div>

          {/* 选中套餐信息 */}
          {selectedPackage && (
            <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-3">
              <div className="text-center">
                <div className="text-blue-300 text-sm">已选择充值套餐：</div>
                <div className="text-white font-bold">
                  {selectedPackage.coins} 金币
                  {selectedPackage.bonus > 0 && ` + ${selectedPackage.bonus} 奖励`} 
                  - ${selectedPackage.price}
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* 固定的支付按钮 */}
        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <Button 
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 text-lg rounded-lg transition-all"
            onClick={handlePayment}
            disabled={loading || !selectedPackage}
          >
            {loading ? 'Processing...' : `充值并购买 (${currentPrice}金币)`}
          </Button>
        </div>
      </Card>
    </div>
  )
}
