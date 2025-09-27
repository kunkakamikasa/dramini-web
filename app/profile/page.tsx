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
  Star
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

export default function ProfilePage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                <div>
                  <h3 className="text-lg font-semibold text-white">{userData.name}</h3>
                  <p className="text-gray-400">{userData.email}</p>
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
                  <Link href="/coins">
                    <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-black">
                      <Coins className="w-4 h-4 mr-2" />
                      Top Up Coins
                    </Button>
                  </Link>
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
    </div>
  )
}
