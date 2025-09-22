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
          if (result.ok && result.data && result.data.length > 0) {
            setHeroItems(result.data);
            console.log('轮播图数据加载成功:', result.data);
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
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
      <div className="absolute inset-y-0 left-0 w-1/2 md:w-2/3 bg-gradient-to-r from-black/70 to-transparent" />

      {/* 文案区域 */}
      <div className="relative z-10 h-full">
        <div className="mx-auto max-w-screen-xl h-full px-4 flex items-end md:items-center">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="pb-10 md:pb-0"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
              {item.title}
            </h1>
            {item.tagline && (
              <p className="mt-3 text-base md:text-lg text-neutral-300">{item.tagline}</p>
            )}
            <div className="mt-6 flex gap-3">
              <Link
                href={`/drama/${item.slug}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-white text-black px-5 py-3 font-semibold hover:bg-gray-100 transition-colors"
                onClick={handlePlayClick}
                data-ev="hero_play_click"
                data-meta={JSON.stringify({ id: item.id })}
              >
                ▶ Play
              </Link>
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary text-white px-5 py-3 font-semibold hover:bg-primary/90 transition-colors"
                onClick={handleWatchFreeClick}
                data-ev="hero_watchfree_click"
              >
                Watch Free
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 轮播指示点 */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {heroItems.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIdx(i)}
            className={`h-2 rounded-full transition-all ${i === idx ? 'w-8 bg-white' : 'w-2 bg-white/60 hover:bg-white/80'}`}
          />
        ))}
      </div>
    </section>
  );
}