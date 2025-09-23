'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Star } from 'lucide-react'
import Image from 'next/image'

interface Title {
  id: string
  slug: string
  title: string
  cover: string
  rating?: number
  tags: string[]
  description?: string
  episodes: number
}

export default function BrowsePage() {
  const [titles, setTitles] = useState<Title[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTitles()
  }, [])

  const fetchTitles = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3002/api/v1'}/public/titles`)
      const data = await response.json()

      console.log('Browse API response:', data)

      // 映射API数据到组件期望的格式
      const mappedTitles = (data.titles || []).map((title: any) => ({
        id: title.id,
        slug: title.slug,
        title: title.mainTitle || title.name,
        cover: title.coverUrl || title.coverImageId || 'https://images.unsplash.com/photo-1748091301969-578c45de4dea?w=400&h=600&fit=crop',
        rating: title.rating,
        tags: [], // 暂时为空
        description: title.subTitle || title.synopsis,
        episodes: title.episodes?.length || 0
      }))

      setTitles(mappedTitles)
    } catch (error) {
      console.error('Failed to fetch titles:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Browse All Dramas</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {titles.map((title) => (
            <Card key={title.id} className="group relative overflow-hidden hover:scale-105 transition-transform">
              <div className="aspect-[9/16] relative">
                <Image
                  src={title.cover}
                  alt={title.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <h3 className="text-white font-semibold text-sm mb-2">{title.title}</h3>
                  <Link href={`/drama/${title.slug}`}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Play className="w-4 h-4 mr-1" />
                      Watch
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {titles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No dramas available</p>
          </div>
        )}
      </div>
    </div>
  )
}
