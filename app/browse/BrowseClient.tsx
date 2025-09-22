'use client'

import { useState, useEffect } from 'react';
import { PosterCard } from '@/components/PosterCard';
import { Poster } from '@/types';
import { getBrowseData } from '@/lib/api';

interface BrowseClientProps {
  category: string;
}

export function BrowseClient({ category }: BrowseClientProps) {
  const [data, setData] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category !== 'all') {
      setLoading(true);
      getBrowseData(category).then((response) => {
        if (response.ok && response.data) {
          setData(response.data as Poster[]);
        }
        setLoading(false);
      });
    }
  }, [category]);

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {data.map((poster) => (
        <PosterCard key={poster.id} poster={poster} />
      ))}
    </div>
  );
}
