'use client'

import { useState, useEffect } from 'react'
import { Carousel } from '@/components/Carousel'
import { fetchApi } from '@/lib/api'
import { Poster } from '@/types'

interface Title {
  id: string
  name: string
  slug: string
  poster_url?: string
  year?: number
  rating?: number
}

export default function TopPage() {
  const [topTitles, setTopTitles] = useState<Poster[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopTitles = async () => {
      try {
        setLoading(true)
        const response = await fetchApi<Title[]>('/titles/top')
        
        if (response.ok && response.data) {
          // 转换 Title[] 为 Poster[]
          const convertedTitles: Poster[] = response.data.map(title => ({
            id: title.id,
            title: title.name,
            poster: title.poster_url || '/placeholder-poster.jpg',
            slug: title.slug,
            year: title.year,
            rating: title.rating
          }))
          setTopTitles(convertedTitles)
        }
      } catch (error) {
        console.error('获取数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopTitles()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">热门排行榜</h1>
      
      <section className="mb-12">
        <Carousel 
          items={topTitles} 
          title="Most Popular"
          itemsPerView={4}
        />
      </section>
    </div>
  )
}
