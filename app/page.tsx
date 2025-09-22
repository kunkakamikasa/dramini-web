'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { fetchApi } from '@/lib/api'

interface Movie {
  id: string
  title: string
  poster: string
  slug: string
}

interface Category {
  id: string
  name: string
  slug: string
  movies: Movie[]
}

interface HomeData {
  trending: Movie[]
  newReleases: Movie[]
  categories: Category[]
}

export default function HomePage() {
  const [data, setData] = useState<HomeData>({
    trending: [],
    newReleases: [],
    categories: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const [trendingRes, newReleaseRes, categoriesRes] = await Promise.all([
          fetchApi<Movie[]>('/movies/trending'),
          fetchApi<Movie[]>('/movies/new-releases'),
          fetchApi<Category[]>('/categories')
        ])

        setData({
          trending: trendingRes.ok ? trendingRes.data : [],
          newReleases: newReleaseRes.ok ? newReleaseRes.data : [],
          categories: categoriesRes.ok ? categoriesRes.data : []
        })
      } catch (error) {
        console.error('获取数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10"></div>
        <div className="relative z-20 text-center text-white">
          <h1 className="text-6xl font-bold mb-4">Dramini</h1>
          <p className="text-xl mb-8">发现精彩内容</p>
          <Link 
            href="/browse" 
            className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            开始观看
          </Link>
        </div>
      </div>

      {/* Trending Section */}
      <div className="px-8 py-12">
        <h2 className="text-3xl font-bold text-white mb-6">热门内容</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data.trending.map((movie) => (
            <Link key={movie.id} href={`/movie/${movie.slug}`}>
              <div className="relative group cursor-pointer">
                <img 
                  src={movie.poster} 
                  alt={movie.title}
                  className="w-full h-64 object-cover rounded-lg transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                    {movie.title}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="px-8 py-12">
        <h2 className="text-3xl font-bold text-white mb-6">分类浏览</h2>
        {data.categories.map((category) => (
          <div key={category.id} className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">{category.name}</h3>
              <Link 
                href={`/browse?category=${category.slug}`}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                查看全部
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {category.movies.map((movie, index) => (
                <Link key={`${category.id}-${movie.id}-${index}`} href={`/movie/${movie.slug}`}>
                  <div className="relative group cursor-pointer">
                    <img 
                      src={movie.poster} 
                      alt={movie.title}
                      className="w-full h-64 object-cover rounded-lg transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                        {movie.title}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
