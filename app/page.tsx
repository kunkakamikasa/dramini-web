'use client'

import { useState, useEffect } from 'react'
import { Hero } from '@/components/Hero';
import { Carousel } from '@/components/Carousel';
import { CategoryChips } from '@/components/CategoryChips';
import { PosterCard } from '@/components/PosterCard';

export default function HomePage() {
  const [data, setData] = useState({
    trending: [],
    newRelease: [],
    categories: []
  })
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const API_BASE = 'http://localhost:3002/api/v1'
      
      // 先测试API是否可用
      const healthResponse = await fetch(`${API_BASE}/health`)
      if (!healthResponse.ok) {
        throw new Error('API not available')
      }

      const [trendingRes, newReleaseRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE}/public/sections/trending-now`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/public/sections/new-release`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/public/sections/popular-categories`).catch(() => ({ ok: false }))
      ])

      const [trendingData, newReleaseData, categoriesData] = await Promise.all([
        trendingRes.ok ? trendingRes.json() : { ok: false },
        newReleaseRes.ok ? newReleaseRes.json() : { ok: false },
        categoriesRes.ok ? categoriesRes.json() : { ok: false }
      ])

      setData({
        trending: trendingData.ok ? (trendingData.items || []) : [],
        newRelease: newReleaseData.ok ? (newReleaseData.items || []) : [],
        categories: categoriesData.ok ? (categoriesData.categories || []) : []
      })
      
      setApiError(false)
    } catch (error) {
      console.error('API Error:', error)
      setApiError(true)
      // 使用模拟数据作为后备
      setData({
        trending: [],
        newRelease: [],
        categories: []
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Loading Dramini...</div>
          <div className="text-muted-foreground">Please wait while we load content</div>
        </div>
      </div>
    )
  }

  if (apiError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Service Unavailable</h1>
          <p className="text-muted-foreground mb-4">
            Please ensure the content API service is running on port 3002.
          </p>
          <button 
            onClick={fetchData}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* 1. 轮播图 Hero Section */}
      <Hero />

      {/* 2. Trending Now */}
      {data.trending.length > 0 && (
        <section className="bg-gradient-to-b from-black to-background py-8 md:py-12">
          <div className="max-w-screen-xl mx-auto px-4">
            <Carousel 
              items={data.trending} 
              title="Trending Now"
              itemsPerView={3}
            />
          </div>
        </section>
      )}

      {/* 3. New Release */}
      {data.newRelease.length > 0 && (
        <section className="bg-gradient-to-b from-background to-black py-8 md:py-12">
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white">New Release</h2>
              <a href="/browse" className="text-sm text-neutral-300 hover:text-white transition-colors">
                View all ›
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {data.newRelease.map((poster, index) => (
                <PosterCard 
                  key={poster.id} 
                  poster={poster} 
                  index={index}
                  section="new-release"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Popular Categories */}
      {data.categories.length > 0 && (
        <section className="py-8 md:py-12">
          <div className="max-w-screen-xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Popular Categories</h2>
            
            <div className="space-y-12">
              {data.categories.map((category) => (
                <div key={category.id}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{category.name}</h3>
                    <a 
                      href={`/browse?category=${category.slug}`} 
                      className="text-sm text-neutral-300 hover:text-white transition-colors"
                    >
                      View all ›
                    </a>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {category.movies.map((poster, index) => (
                      <PosterCard 
                        key={poster.id} 
                        poster={poster} 
                        index={index}
                        section={`category-${category.slug}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works - 静态内容 */}
      <section className="py-16 bg-card">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Get started in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { id: '1', title: '注册账户', description: '创建您的专属账户' },
              { id: '2', title: '选择内容', description: '浏览海量精彩内容' },
              { id: '3', title: '开始观看', description: '随时随地享受观看' }
            ].map((step, index) => (
              <div key={step.id} className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
