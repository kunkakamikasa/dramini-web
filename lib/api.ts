// API响应类型定义
export interface ApiResponse<T = any> {
  ok: boolean
  data: T
  items?: T[]  // 添加items属性
  message?: string
  error?: string
}

export interface Poster {
  id: string
  slug: string
  title: string
  cover: string
  rating?: number
  tags: Tag[]
  description?: string
  totalEpisodes: number
}

export interface Title extends Poster {
  // Title和Poster相同
}

export interface Episode {
  id: string
  episodeNum: number
  name?: string
  description?: string
  videoUrl: string
  duration?: number
  thumbnail?: string
  status: string
  isOnline: boolean
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Category {
  id: string
  name: string
  slug: string
  titles?: Title[]
}

export interface Collection {
  id: string
  name: string
  items: Title[]
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3002/api/v1'

export async function fetchApi(endpoint: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API fetch error:', error)
    return {
      ok: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export const api = {
  getTitles: (category?: string) => fetchApi(`/public/titles${category ? `?category=${category}` : ''}`),
  getTitle: (id: string) => fetchApi(`/public/titles/${id}/detail`),
  getEpisodes: (titleId: string) => fetchApi(`/public/titles/${titleId}/episodes`),
  getEpisode: (id: string) => fetchApi(`/public/episodes/${id}/detail`),
  getHeroBanners: () => fetchApi('/public/hero-banners'),
  getCollections: () => fetchApi('/public/collections/home'),
  getSections: {
    trendingNow: () => fetchApi('/public/sections/trending-now'),
    newRelease: () => fetchApi('/public/sections/new-release'),
    popularCategories: () => fetchApi('/public/sections/popular-categories')
  }
}

// 兼容性函数
export const getBrowseData = (category?: string) => api.getTitles(category)
export const getCollectionsData = () => api.getCollections()