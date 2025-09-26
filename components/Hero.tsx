'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface HeroItem {
  id: string
  slug: string
  title: string
  tagline: string
  backdrop: string
}

export default function Hero() {
  const [heroItems, setHeroItems] = useState<HeroItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchHeroBanners() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/public/hero-banners`);
        if (response.ok) {
          const result = await response.json();
          console.log('Hero banners API response:', result);
          
          if (result.banners && result.banners.length > 0) {
            // 获取titles数据以获取正确的slug
            const titlesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/public/titles`);
            const titlesResult = await titlesResponse.json();
            
            if (titlesResult.titles && titlesResult.titles.length > 0) {
              // 创建movieId到slug的映射
              const movieSlugMap = new Map();
              titlesResult.titles.forEach((title: any) => {
                movieSlugMap.set(title.id, title.slug);
              });
              
              // 映射API数据到HeroItem格式，使用正确的slug
              const mappedBanners = result.banners.map((banner: any) => ({
                id: banner.id,
                slug: movieSlugMap.get(banner.movieId) || banner.movieId || 'default',
                title: banner.title || 'Untitled',
                tagline: banner.subtitle || '',
                backdrop: banner.imageUrl || 'https://images.unsplash.com/photo-1748091301969-578c45de4dea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920'
              }));
              setHeroItems(mappedBanners);
              console.log('轮播图数据加载成功:', mappedBanners);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch hero banners:', error);
        // 使用默认数据
      } finally {
        setIsLoading(false);
      }
    }
    fetchHeroBanners();
  }, []);

  useEffect(() => {
    if (heroItems.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % heroItems.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroItems]);

  const handlePlayClick = () => {
    console.log('Play button clicked');
  };

  const handleWatchFreeClick = () => {
    console.log('Watch free button clicked');
  };

  if (isLoading) {
    return (
      <div className="relative h-[70vh] bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  if (heroItems.length === 0) {
    return (
      <div className="relative h-[70vh] bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">暂无轮播图</div>
      </div>
    );
  }

  const currentItem = heroItems[currentIndex];

  return (
    <div className="relative h-[70vh] overflow-hidden">
      {/* 背景图片 */}
      <div className="absolute inset-0">
        <Image
          src={currentItem.backdrop}
          alt={currentItem.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>

      {/* 内容 */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {currentItem.title}
            </h1>
            {currentItem.tagline && (
              <p className="text-lg md:text-xl text-gray-200 mb-8">
                {currentItem.tagline}
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/drama/${currentItem.slug}`}
                onClick={handlePlayClick}
                className="inline-flex items-center justify-center px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 5v10l8-5-8-5z"/>
                </svg>
                立即观看
              </Link>
              
              <button
                onClick={handleWatchFreeClick}
                className="inline-flex items-center justify-center px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                </svg>
                免费试看
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 轮播指示器 */}
      {heroItems.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
