'use client'

import { useState, useEffect } from 'react'
import { fetchApi } from '@/lib/api'

interface UserCoin {
  id: string
  amount: number
  // 添加其他必要字段
}

export default function CoinsPage() {
  const [userCoins, setUserCoins] = useState<UserCoin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserCoins = async () => {
      try {
        setLoading(true)
        const coinsRes = await fetchApi<UserCoin>('/user/coins')
        
        if (coinsRes.ok) {
          setUserCoins(coinsRes.data)
        }
      } catch (error) {
        console.error('获取数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserCoins()
  }, [])

  if (loading) {
    return <div>加载中...</div>
  }

  return (
    <div>
      <h1>我的金币</h1>
      {userCoins ? (
        <p>当前金币: {userCoins.amount}</p>
      ) : (
        <p>暂无金币数据</p>
      )}
    </div>
  )
}
