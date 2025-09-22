'use client';

import { useState, useEffect } from 'react';
import { PosterCard } from '@/components/PosterCard';
import { Poster } from '@/types';
import { getBrowseData } from '@/lib/api';

interface BrowseClientProps {
  category: string;
  initialData: Poster[];
}

export function BrowseClient({ category, initialData }: BrowseClientProps) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category !== 'all') {
      setLoading(true);
      getBrowseData(category).then(({ data }) => {
        setData(data);
        setLoading(false);
      });
    } else {
      setData(initialData);
    }
  }, [category, initialData]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[9/16] bg-muted rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">No dramas found</h3>
        <p className="text-muted-foreground">
          Try selecting a different category or check back later for new content.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
      {data.map((poster, index) => (
        <PosterCard 
          key={poster.id} 
          poster={poster} 
          index={index}
          section="browse"
        />
      ))}
    </div>
  );
}

