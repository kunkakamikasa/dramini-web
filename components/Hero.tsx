'use client';

import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { analytics } from '@/lib/analytics';

type HeroItem = {
  id: string;
  slug: string;
  title: string;
  tagline?: string;
  backdrop: string;
};

// 默认轮播图（作为后备）
const DEFAULT_HERO_ITEMS: HeroItem[] = [
  { 
    id: 'default', 
    slug: 'default',
    title: 'Welcome to Dramini', 
    tagline: 'Discover amazing content', 
    backdrop: 'https://images.unsplash.com/photo-1748091301969-578c45de4dea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920'
  }
];

export function Hero() {
  const [heroItems, setHeroItems] = useState<HeroItem[]>(DEFAULT_HERO_ITEMS);
  const [idx, setIdx] = useState(0);
  const timer = useRef<number | null>(null);

  // 从API获取轮播图数据
  useEffect(() => {
    async function fetchHeroBanners() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/public/hero-banners`);
        if (response.ok) {
          const result = await response.json();
          console.log('Hero banners API response:', result);
          
          if (result.banners && result.banners.length > 0) {
            // 映射API数据到HeroItem格式
            const mappedBanners = result.banners.map((banner: any) => ({
              id: banner.id,
              slug: banner.movieId || banner.id || 'default', // 优先使用movieId，其次使用id
              title: banner.title || 'Untitled',
              tagline: banner.subtitle || '',
              backdrop: banner.imageUrl || 'https://images.unsplash.com/photo-1748091301969-578c45de4dea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920'
            }));
            setHeroItems(mappedBanners);
            console.log('轮播图数据加载成功:', mappedBanners);
          }
        }
      } catch (error) {
        console.error('Failed to fetch hero banners:', error);
        // 使用默认数据
      }
    }

    fetchHeroBanners();
  }, []);

  useEffect(() => {
    // 自动轮播：5s 切换
    const play = () => {
      timer.current = window.setInterval(() => {
        setIdx(i => (i + 1) % heroItems.length);
      }, 5000);
    };
    const stop = () => { 
      if (timer.current) { 
        clearInterval(timer.current); 
        timer.current = null; 
      } 
    };
    play();
    const onVis = () => (document.hidden ? stop() : play());
    document.addEventListener('visibilitychange', onVis);
    return () => { 
      stop(); 
      document.removeEventListener('visibilitychange', onVis); 
    };
  }, [heroItems.length]);

  const item = heroItems[idx];

  const handlePlayClick = () => {
    analytics.heroCtaClick('watch', 'hero');
  };

  const handleWatchFreeClick = () => {
    analytics.heroCtaClick('watch', 'hero');
  };

  return (
    <section 
      className="relative w-full h-[72vh] md:h-[78vh] lg:h-[82vh] overflow-hidden"
      role="region"
      aria-roledescription="carousel"
    >
      {/* 背景图 */}
      <Image
        src={item.backdrop}
        alt={item.title}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      
      {/* 渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      
      {/* 内容 */}
      <div className="relative z-10 flex items-center h-full">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {item.title}
            </h1>
            
            {item.tagline && (
              <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
                {item.tagline}
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/drama/${item.slug}`}
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
          </motion.div>
        </div>
      </div>
      
      {/* 轮播指示器 */}
      {heroItems.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setIdx(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === idx ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}