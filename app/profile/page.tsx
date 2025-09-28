'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Coins, 
  History, 
  User, 
  LogOut, 
  Play, 
  Clock,
  TrendingUp,
  Star,
  X,
  CreditCard,
  Zap
} from 'lucide-react'

interface UserData {
  id: string
  name: string
  email: string
  coins: number
  watchHistory: WatchHistoryItem[]
}

interface WatchHistoryItem {
  id: string
  title: string
  episode: string
  watchedAt: string
  duration: number
  thumbnail: string
}

interface PaymentPackage {
  id: string
  name: string
  coins: number
  bonus: number
  price: number
  discount?: string | null
  isNewUser?: boolean
  description?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [paymentPackages, setPaymentPackages] = useState<PaymentPackage[]>([])
  const [selectedPackage, setSelectedPackage] = useState<PaymentPackage | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card'>('paypal')

  useEffect(() => {
    // 检查用户是否已登录
    const userId = localStorage.getItem('userId')
    if (!userId) {
      router.push('/login?redirect=/profile')
      return
    }

    // 获取用户数据
    fetchUserData()
  }, [router])

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem('userId')
      const response = await fetch(`/api/user/profile?userId=${userId}`)
      
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      } else {
        // 如果API失败，使用本地存储的数据
        setUserData({
          id: userId || '',
          name: localStorage.getItem('userName') || 'User',
          email: localStorage.getItem('userEmail') || '',
          coins: 0, // 这里应该从API获取真实的金币余额
          watchHistory: []
        })
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      // 使用本地存储的数据作为fallback
      const userId = localStorage.getItem('userId')
      setUserData({
        id: userId || '',
        name: localStorage.getItem('userName') || 'User',
        email: localStorage.getItem('userEmail') || '',
        coins: 0,
        watchHistory: []
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentPackages = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com/api/v1'
      const response = await fetch(`${apiBase}/payment-packages`)
      const data = await response.json()
      
      if (data.ok && data.packages) {
        // 转换数据格式以匹配PaymentModal的期望格式
        const formattedPackages = data.packages.map((pkg: any) => ({
          id: pkg.id,
          name: pkg.name,
          coins: pkg.coins,
          bonus: pkg.bonus || 0,
          price: pkg.price,
          discount: pkg.discount,
          isNewUser: pkg.isNewUser || false,
          description: pkg.description
        }))
        setPaymentPackages(formattedPackages)
      } else {
        // 使用默认套餐作为后备
        setPaymentPackages([
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
      setPaymentPackages([
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
  }

  const handleTopUp = async () => {
    if (!selectedPackage) {
      alert('Please select a package first')
      return
    }

    const userId = localStorage.getItem('userId')
    if (!userId) {
      alert('Please login first')
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/v1/user/purchase/checkout/${paymentMethod}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tierKey: selectedPackage.id,
          userId: userId
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
        } else {
          alert('Payment initiated successfully!')
        }
      } else {
        alert('Payment failed. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    router.push('/')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-4">Loading...</div>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-4">User not found</div>
          <Link href="/login">
            <Button className="bg-red-600 hover:bg-red-700">Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold text-red-500">
                Dramini
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-yellow-400">
                <Coins className="w-5 h-5" />
                <span className="font-semibold">{userData.coins}</span>
              </div>
              
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* User Info */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl font-bold">
                      {userData.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{userData.name}</h3>
                    <p className="text-gray-400">{userData.email}</p>
                  </div>
                </div>
                
                <Separator className="bg-gray-700" />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Coins Balance</span>
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Coins className="w-4 h-4" />
                      <span className="font-semibold">{userData.coins}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Episodes Watched</span>
                    <span className="text-white font-semibold">{userData.watchHistory.length}</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-black"
                    onClick={() => {
                      fetchPaymentPackages()
                      setShowTopUpModal(true)
                    }}
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Top Up Coins
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Watch History */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Watch History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userData.watchHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No watch history yet</h3>
                    <p className="text-gray-500 mb-6">Start watching episodes to see your history here</p>
                    <Link href="/">
                      <Button className="bg-red-600 hover:bg-red-700">
                        <Play className="w-4 h-4 mr-2" />
                        Start Watching
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userData.watchHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                      >
                        <div className="w-20 h-12 bg-gray-700 rounded flex items-center justify-center">
                          <Play className="w-6 h-6 text-gray-400" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold truncate">{item.title}</h4>
                          <p className="text-gray-400 text-sm">{item.episode}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(item.duration)}
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {formatDate(item.watchedAt)}
                            </div>
                          </div>
                        </div>
                        
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Top Up Coins</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTopUpModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Payment Packages */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">充值金币</h3>
                </div>

                <div className="space-y-3">
                  {/* 新用户特惠包 */}
                  {paymentPackages.filter(pkg => pkg.isNewUser).map((pkg) => (
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
                    {paymentPackages.filter(pkg => !pkg.isNewUser).map((pkg) => (
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
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3">Payment Method</h3>
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
                <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-3 mb-4">
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

              {/* Pay Button */}
              <Button
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 text-lg rounded-lg transition-all"
                onClick={handleTopUp}
                disabled={!selectedPackage}
              >
                <Zap className="w-4 h-4 mr-2" />
                充值金币
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
