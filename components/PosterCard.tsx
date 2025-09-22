'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Play, Lock, Star } from 'lucide-react';
import { Poster, PosterCardProps } from '@/types';
import { analytics } from '@/lib/analytics';
import { cn } from '@/lib/utils';

export function PosterCard({ poster, index = 0, section = 'unknown', onWatch, onUnlock }: PosterCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    analytics.posterClick(poster.id, index, section);
  };

  const handleUnlockClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    analytics.posterClick(poster.id, index, section);
    onUnlock?.(poster);
  };

  return (
    <div 
      className="group relative cursor-pointer transform transition-all duration-300 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster Image */}
      <div className="aspect-[9/16] rounded-xl overflow-hidden shadow-card">
        <Image
          src={poster.cover}
          alt={poster.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        
        {/* VIP Badge */}
        {poster.isVip && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-secondary to-yellow-400 text-background px-2 py-1 rounded-full text-xs font-medium">
            VIP
          </div>
        )}

        {/* Rating Badge */}
        {poster.rating && (
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center">
            <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
            {poster.rating}
          </div>
        )}

        {/* Custom Badges */}
        {poster.badges && poster.badges.length > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
            {poster.badges.map((badge, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {badge}
              </Badge>
            ))}
          </div>
        )}

        {/* Hover Overlay */}
        <div className={cn(
          'absolute inset-0 bg-black/60 flex flex-col justify-end p-4 transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}>
          <div className="space-y-3">
            <div>
              <h3 className="text-white font-semibold text-lg mb-1">{poster.title}</h3>
              {poster.episodes && poster.freeEpisodes && (
                <p className="text-gray-300 text-sm">
                  {poster.freeEpisodes} free of {poster.episodes} episodes
                </p>
              )}
              {poster.category && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  {poster.category}
                </Badge>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Link 
                href={`/drama/${poster.slug}`} 
                onClick={handleCardClick}
                className="flex-1"
              >
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 w-full"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Watch
                </Button>
              </Link>
              {poster.locked && (
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="bg-gradient-to-r from-secondary to-yellow-400 text-background"
                  onClick={handleUnlockClick}
                >
                  <Lock className="w-4 h-4 mr-1" />
                  Unlock
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
