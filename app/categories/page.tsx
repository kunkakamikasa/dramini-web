'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play } from 'lucide-react'
import Image from 'next/image'

interface Category {
  id: string
  name: string
  slug: string
  movies: Array<{
    id: string
    slug: string
    title: string
    cover: string
    rating?: number
  }>
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3002/api/v1'}/public/sections/popular-categories`)
      const data = await response.json()
      
      if (data.ok) {
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
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
        <h1 className="text-3xl font-bold mb-8">Categories</h1>
        
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category.id}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                <Link 
                  href={`/browse?category=${category.slug}`}
                  className="text-sm text-neutral-300 hover:text-white transition-colors"
                >
                  View all ›
                </Link>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {category.movies.map((movie) => (
                  <Card key={movie.id} className="group relative overflow-hidden hover:scale-105 transition-transform">
                    <div className="aspect-[9/16] relative">
                      <Image
                        src={movie.cover}
                        alt={movie.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <h3 className="text-white font-semibold text-sm mb-2">{movie.title}</h3>
                        <Link href={`/drama/${movie.slug}`}>
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
            </div>
          ))}
        </div>
        
        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No categories available</p>
          </div>
        )}
      </div>
    </div>
  )
}
