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
  bonusCoins: number
  priceUsd: number
  isPopular?: boolean
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/v1/payment-packages`)
      if (response.ok) {
        const data = await response.json()
        setPaymentPackages(data.packages || [])
      }
    } catch (error) {
      console.error('Failed to fetch payment packages:', error)
      // 使用默认套餐
      setPaymentPackages([
        { id: '1', name: 'Starter Pack', coins: 100, bonusCoins: 0, priceUsd: 0.99 },
        { id: '2', name: 'Popular Pack', coins: 500, bonusCoins: 50, priceUsd: 4.99, isPopular: true },
        { id: '3', name: 'Premium Pack', coins: 1000, bonusCoins: 200, priceUsd: 9.99 },
        { id: '4', name: 'VIP Pack', coins: 2000, bonusCoins: 500, priceUsd: 19.99 }
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
              <div className="space-y-3 mb-6">
                {paymentPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedPackage?.id === pkg.id
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{pkg.name}</h3>
                          {pkg.isPopular && (
                            <Badge className="bg-red-500 text-white text-xs">Popular</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-yellow-400 mt-1">
                          <Coins className="w-4 h-4" />
                          <span className="font-semibold">{pkg.coins}</span>
                          {pkg.bonusCoins > 0 && (
                            <span className="text-green-400 text-sm">+{pkg.bonusCoins} bonus</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">${pkg.priceUsd}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                    className={`${
                      paymentMethod === 'paypal'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                    }`}
                    onClick={() => setPaymentMethod('paypal')}
                  >
                    PayPal
                  </Button>
                  <Button
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    className={`${
                      paymentMethod === 'card'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                    }`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Card
                  </Button>
                </div>
              </div>

              {/* Pay Button */}
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={handleTopUp}
                disabled={!selectedPackage}
              >
                <Zap className="w-4 h-4 mr-2" />
                Pay Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
