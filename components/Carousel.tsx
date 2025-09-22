'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Poster, CarouselProps } from '@/types';
import { PosterCard } from './PosterCard';
import { analytics } from '@/lib/analytics';
import { cn } from '@/lib/utils';

export function Carousel({ items = [], title, showNavigation = true, itemsPerView = 3 }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // 确保items是数组且有默认值
  const safeItems = Array.isArray(items) ? items : [];
  const maxIndex = Math.max(0, safeItems.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => prev <= 0 ? maxIndex : prev - 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  // Touch/drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - (carouselRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !carouselRef.current) return;
    const x = e.touches[0].pageX - (carouselRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== carouselRef.current) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('keydown', handleKeyDown);
      carousel.setAttribute('tabindex', '0');
      carousel.setAttribute('role', 'region');
      carousel.setAttribute('aria-label', title || 'Carousel');
    }

    return () => {
      if (carousel) {
        carousel.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [title]);

  // Track impressions
  useEffect(() => {
    if (safeItems.length > 0) {
      const visibleItems = safeItems.slice(currentIndex, currentIndex + itemsPerView);
      visibleItems.forEach((item, index) => {
        analytics.posterImpression(item.id, currentIndex + index, title || 'carousel');
      });
    }
  }, [currentIndex, safeItems, itemsPerView, title]);

  // 如果没有数据，显示空状态
  if (safeItems.length === 0) {
    return (
      <div className="space-y-4">
        {title && (
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">{title}</h2>
          </div>
        )}
        <div className="text-center py-8 text-gray-400">
          No content available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">{title}</h2>
          {showNavigation && (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={prevSlide}
                className="border-2"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={nextSlide}
                className="border-2"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Desktop Grid */}
      <div className="hidden lg:block">
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${itemsPerView}, 1fr)` }}>
          {safeItems.slice(currentIndex, currentIndex + itemsPerView).map((item, index) => (
            <PosterCard 
              key={item.id} 
              poster={item} 
              index={currentIndex + index}
              section={title || 'carousel'}
            />
          ))}
        </div>
      </div>

      {/* Mobile Horizontal Scroll */}
      <div className="lg:hidden">
        <div 
          ref={carouselRef}
          className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {safeItems.map((item, index) => (
            <div key={item.id} className="flex-none w-48">
              <PosterCard 
                poster={item} 
                index={index}
                section={title || 'carousel'}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      {showNavigation && safeItems.length > itemsPerView && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                index === currentIndex ? 'bg-primary' : 'bg-muted'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
