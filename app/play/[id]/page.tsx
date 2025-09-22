import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Play, Clock, Calendar } from 'lucide-react'
import { fetchApi } from '@/lib/api'

interface EpisodeData {
  id: string
  episodeNum: number
  name?: string
  description?: string
  videoUrl: string
  duration?: number
  thumbnail?: string
  status: string
  isOnline: boolean
  title: {
    id: string
    name: string
    slug: string
    mainTitle?: string
    subTitle?: string
    coverUrl: string
    synopsis?: string
    category?: {
      name: string
    }
  }
}

async function getEpisodeData(episodeId: string): Promise<EpisodeData | null> {
  try {
    const response = await fetchApi(`/public/episodes/${episodeId}/detail`)
    if (!response.ok) return null
    return response.data as EpisodeData
  } catch (error) {
    console.error('Failed to fetch episode data:', error)
    return null
  }
}

export default async function PlayPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const episodeData = await getEpisodeData(params.id)
  
  if (!episodeData) {
    notFound()
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 视频播放器区域 */}
      <div className="max-w-6xl mx-auto p-6 pt-8">
        {/* 返回按钮 */}
        <div className="mb-4">
          <Link href={`/drama/${episodeData.title.slug}`}>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回剧集列表
            </Button>
          </Link>
        </div>

        <div className="aspect-video bg-gray-900 rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
          {/* 这里应该集成实际的视频播放器 */}
          {episodeData.thumbnail ? (
            <Image
              src={episodeData.thumbnail}
              alt={`第${episodeData.episodeNum}集`}
              fill
              className="object-cover opacity-50"
            />
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <Play className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400 mb-2">视频播放器</p>
              <p className="text-sm text-gray-500">
                视频地址: {episodeData.videoUrl}
              </p>
              <p className="text-sm text-gray-500">
                时长: {formatDuration(episodeData.duration)}
              </p>
            </div>
          </div>
        </div>
        
        {/* 剧集和剧目信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-2">
                第{episodeData.episodeNum}集
                {episodeData.name && ` - ${episodeData.name}`}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(episodeData.duration)}
                </span>
                <Badge variant="outline" className="text-xs">
                  {episodeData.status === 'PUBLISHED' ? '已发布' : '草稿'}
                </Badge>
                {episodeData.title.category && (
                  <Badge variant="secondary" className="text-xs">
                    {episodeData.title.category.name}
                  </Badge>
                )}
              </div>
              
              {episodeData.description && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">本集简介</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {episodeData.description}
                  </p>
                </div>
              )}
              
              {episodeData.title.synopsis && (
                <div>
                  <h3 className="font-semibold mb-2">剧情简介</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {episodeData.title.synopsis}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            {/* 剧目信息卡片 */}
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Image
                  src={episodeData.title.coverUrl}
                  alt={episodeData.title.name}
                  width={60}
                  height={90}
                  className="rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{episodeData.title.name}</h3>
                  {episodeData.title.mainTitle && (
                    <p className="text-sm text-gray-400">
                      {episodeData.title.mainTitle}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-400">
                <div>集数: 第{episodeData.episodeNum}集</div>
                <div>时长: {formatDuration(episodeData.duration)}</div>
                <div>状态: {episodeData.status === 'PUBLISHED' ? '已发布' : '草稿'}</div>
              </div>
            </div>
            
            <Link href={`/drama/${episodeData.title.slug}`}>
              <Button variant="outline" className="w-full">
                查看所有剧集
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}