'use client'

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { Play, Lock, Star } from 'lucide-react';
import { Poster, PosterCardProps } from '@/types';
import { analytics } from '@/lib/analytics';
import { cn } from '@/lib/utils';

export function PosterCard({ poster, index = 0, section = 'unknown', onWatch, onUnlock }: PosterCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    analytics.posterClick(poster.id, index, section);
    onWatch?.(poster);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    analytics.posterClick(poster.id, index, section);
    onWatch?.(poster);
  };

  const handleUnlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    analytics.posterClick(poster.id, index, section);
    onUnlock?.(poster);
  };

  return (
    <div 
      className={cn(
        "group relative cursor-pointer transition-all duration-300 hover:scale-105",
        "w-full max-w-[200px] mx-auto"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="aspect-[9/16] rounded-xl overflow-hidden shadow-card">
        <Image
          src={poster.cover || poster.poster}
          alt={poster.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className={cn(
          "absolute inset-0 bg-black transition-opacity duration-300",
          isHovered ? "opacity-60" : "opacity-0"
        )}>
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlayClick}
              className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors"
            >
              <Play className="h-6 w-6 text-white fill-white" />
            </button>
          </div>
        </div>

        {/* Lock overlay for premium content */}
        {poster.rating && poster.rating > 4.5 && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-yellow-500 text-black">
              <Star className="h-3 w-3 mr-1" />
              {poster.rating}
            </Badge>
          </div>
        )}

        {/* Premium lock */}
        {poster.rating && poster.rating > 4.5 && (
          <div className="absolute top-2 left-2">
            <button
              onClick={handleUnlockClick}
              className="bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <Lock className="h-4 w-4 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="mt-2 px-1">
        <h3 className="text-sm font-medium text-white truncate group-hover:text-gray-300 transition-colors">
          {poster.title}
        </h3>
        {poster.year && (
          <p className="text-xs text-gray-400 mt-1">{poster.year}</p>
        )}
      </div>
    </div>
  );
}
