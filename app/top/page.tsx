'use client'

import { useState, useEffect } from 'react'
import { Carousel } from '@/components/Carousel'

interface Title {
  id: string
  slug: string
  title: string
  cover: string
  rating?: number
  tags: string[]
  description?: string
  episodes: number
}

export default function TopChartsPage() {
  const [topTitles, setTopTitles] = useState<Title[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopTitles()
  }, [])

  const fetchTopTitles = async () => {
    try {
      // 获取热门内容，按rating排序
      const response = await fetch('http://localhost:3002/api/v1/public/titles')
      const data = await response.json()
      
      if (data.ok) {
        // 模拟排序逻辑，实际应该从API获取排序后的数据
        const sortedTitles = (data.items || []).sort((a: Title, b: Title) => {
          return (b.rating || 0) - (a.rating || 0)
        })
        setTopTitles(sortedTitles)
      }
    } catch (error) {
      console.error('Failed to fetch top titles:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Top Charts</h1>
        
        {/* 热门排行榜 */}
        <section className="mb-12">
          <Carousel 
            items={topTitles} 
            title="Most Popular"
            itemsPerView={4}
          />
        </section>

        {/* 新上榜 */}
        <section className="mb-12">
          <Carousel 
            items={topTitles.slice(0, 6)} 
            title="New to Charts"
            itemsPerView={3}
          />
        </section>

        {/* 本周热门 */}
        <section className="mb-12">
          <Carousel 
            items={topTitles.slice(0, 8)} 
            title="This Week's Favorites"
            itemsPerView={4}
          />
        </section>
      </div>
    </div>
  )
}
