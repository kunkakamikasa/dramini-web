'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Play, 
  Pause,
  Lock,
  ArrowLeft,
  Coins,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  MoreHorizontal,
  Search,
  Download,
  History,
  X,
  CreditCard,
  Zap
} from 'lucide-react'

interface Episode {
  id: string
  episodeNum: number
  name?: string
  videoUrl: string
  isFree: boolean
  priceCoins: number
}

interface TitleData {
  id: string
  slug: string
  name: string
  synopsis?: string
  coverUrl: string
  episodes: Episode[]
  totalEpisodes: number
  seriesPriceCoins: number
}

export default function DramaPage() {
  const params = useParams()
  const slug = params.slug as string
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  
  const [titleData, setTitleData] = useState<TitleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchTitleData()
    }
  }, [slug])

  useEffect(() => {
    if (currentEpisode && videoRef.current && currentEpisode.videoUrl) {
      loadVideo(currentEpisode.videoUrl)
    }
  }, [currentEpisode])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const fetchTitleData = async () => {
    try {
      setDebugInfo('Fetching data...')
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://dramini-api.onrender.com/api/v1'
      
      const titlesResponse = await fetch(`${API_BASE}/public/titles`)
      const titlesData = await titlesResponse.json()
      
      if (!titlesData.titles) {
        setDebugInfo('API Error: No titles data')
        return
      }
      
      const titles = titlesData.titles || []
      const title = titles.find((t: any) => t.slug === slug)
      
      if (!title) {
        setDebugInfo('Title not found for slug: ' + slug)
        return
      }
      
      // 直接使用title数据，不需要额外的详情API
      const processedEpisodes = (title.episodes || []).map((episode: any) => ({
        id: episode.id,
        episodeNum: episode.episodeNum || episode.epNumber || 1,
        name: episode.name || `Episode ${episode.episodeNum || episode.epNumber || 1}`,
        videoUrl: episode.videoUrl || episode.videoId || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // 临时测试视频
        isFree: episode.isFree || false,
        priceCoins: episode.priceCoins || 100
      }))
      
      setTitleData({
        id: title.id,
        slug: title.slug,
        name: title.name,
        synopsis: title.synopsis,
        coverUrl: title.coverUrl,
        episodes: processedEpisodes,
        totalEpisodes: processedEpisodes.length,
        seriesPriceCoins: 0
      })
      
      if (processedEpisodes.length > 0) {
        setCurrentEpisode(processedEpisodes[0])
        setDebugInfo('Ready!')
      }
    } catch (error: any) {
      setDebugInfo('Network Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadVideo = async (videoUrl: string) => {
    if (!videoRef.current || !videoUrl) {
      setDebugInfo('No video element or URL')
      return
    }

    try {
      setDebugInfo('Loading video: ' + videoUrl)
      
      if (videoUrl.includes('.m3u8')) {
        const Hls = (await import('hls.js')).default
        
        if (Hls.isSupported()) {
          const hls = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
            maxBufferLength: 30
          })
          
          hls.loadSource(videoUrl)
          hls.attachMedia(videoRef.current)
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setDebugInfo('HLS ready!')
          })
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS Error:', data)
            setDebugInfo('HLS Error: ' + data.details)
          })
        } else {
          setDebugInfo('HLS not supported')
        }
      } else {
        // 普通视频文件
        videoRef.current.src = videoUrl
        setDebugInfo('Video source set')
      }
      
      if (videoRef.current) {
        videoRef.current.volume = volume
        videoRef.current.muted = isMuted
      }
    } catch (error) {
      console.error('Video load error:', error)
      setDebugInfo('Video load error: ' + (error as Error).message)
    }
  }

  const togglePlay = async () => {
    if (!videoRef.current) {
      setDebugInfo('No video element')
      return
    }
    
    try {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
        setDebugInfo('Video paused')
      } else {
        await videoRef.current.play()
        setIsPlaying(true)
        setDebugInfo('Video playing')
      }
    } catch (error) {
      console.error('Play error:', error)
      setDebugInfo('Play error: ' + (error as Error).message)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    const newMuted = !isMuted
    videoRef.current.muted = newMuted
    setIsMuted(newMuted)
  }

  const adjustVolume = (newVolume: number) => {
    if (!videoRef.current) return
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    videoRef.current.volume = clampedVolume
    setVolume(clampedVolume)
    
    if (clampedVolume === 0) {
      setIsMuted(true)
      videoRef.current.muted = true
    } else if (isMuted) {
      setIsMuted(false)
      videoRef.current.muted = false
    }
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await containerRef.current.requestFullscreen()
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current || duration === 0) return
    
    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration
    
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleEpisodeClick = (episode: Episode) => {
    // 检查用户是否已登录
    const userId = localStorage.getItem('userId')
    if (!userId) {
      alert('Please login first to watch episodes')
      // 跳转到登录页面
      window.location.href = '/login'
      return
    }

    if (episode.isFree) {
      setCurrentEpisode(episode)
      setIsPlaying(false)
      setCurrentTime(0)
    } else {
      setSelectedEpisode(episode)
      setShowPaymentModal(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-4">Loading...</div>
          <div className="text-sm text-gray-400">{debugInfo}</div>
          <div className="text-xs text-gray-500 mt-2">Slug: {slug}</div>
        </div>
      </div>
    )
  }

  if (!titleData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Drama not found</h2>
          <div className="text-sm text-gray-400 mb-4">Debug: {debugInfo}</div>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between p-4 bg-black border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="text-2xl font-bold text-red-500">Dramini</div>
          <nav className="hidden md:flex items-center gap-6 ml-8">
            <Link href="/" className="text-white hover:text-red-500 transition-colors">Home</Link>
            <Link href="/browse" className="text-white hover:text-red-500 transition-colors">Categories</Link>
            <a href="#" className="text-white hover:text-red-500 transition-colors">Fandom</a>
            <a href="#" className="text-white hover:text-red-500 transition-colors">Brand</a>
            <a href="#" className="text-white hover:text-red-500 transition-colors">Contest</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <Search className="w-4 h-4" />
            <span className="ml-2 hidden sm:inline">Search</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <Download className="w-4 h-4" />
            <span className="ml-2 hidden sm:inline">Download</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <History className="w-4 h-4" />
            <span className="ml-2 hidden sm:inline">History</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            English
          </Button>
          <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
        </div>
      </header>

      <div className="bg-gray-800 text-xs text-gray-400 p-2 text-center">
        {debugInfo} | Episodes: {titleData.episodes.length} | Volume: {Math.round(volume * 100)}%
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        <div className="flex-1 relative bg-gray-900">
          <div className="relative w-full h-full flex items-center justify-center p-6">
            {currentEpisode ? (
              <div 
                ref={containerRef}
                className="relative w-full h-full max-w-md mx-auto flex items-center"
              >
                <div className="relative w-full aspect-[9/16] max-h-[calc(100vh-200px)] bg-black rounded-xl overflow-hidden shadow-2xl">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    controls={false}
                    muted={isMuted}
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onCanPlay={() => setDebugInfo('Ready!')}
                    onTimeUpdate={() => {
                      if (!isDragging && videoRef.current) {
                        setCurrentTime(videoRef.current.currentTime)
                      }
                    }}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setDuration(videoRef.current.duration)
                      }
                    }}
                    poster={titleData.coverUrl?.startsWith('http') ? titleData.coverUrl : `${process.env.NEXT_PUBLIC_CMS_BASE || 'https://cms.shortdramini.com'}${titleData.coverUrl}`}
                  />
                  
                  {currentEpisode && !currentEpisode.isFree && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
                      <div className="text-center space-y-4 p-6">
                        <div className="text-2xl">🔒</div>
                        <h3 className="text-xl font-bold text-white">Pay to continue watching</h3>
                        <div className="text-gray-300">
                          Price: {currentEpisode.priceCoins} Coins or {currentEpisode.priceCoins} Bonuses
                        </div>
                        <div className="space-y-3">
                          <Button 
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2"
                            onClick={() => {
                              setSelectedEpisode(currentEpisode)
                              setShowPaymentModal(true)
                            }}
                          >
                            🪙 Buy with Coins
                          </Button>
                          <Button 
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2"
                            onClick={() => {
                              setSelectedEpisode(currentEpisode)
                              setShowPaymentModal(true)
                            }}
                          >
                            💳 Top Up & Buy
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Button 
                        className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                        onClick={togglePlay}
                      >
                        <Play className="w-8 h-8 text-white ml-1" />
                      </Button>
                    </div>
                  )}
                  
                  {currentEpisode && (
                    <div 
                      className={`absolute bottom-4 left-4 right-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}
                      onMouseEnter={() => setShowControls(true)}
                      onMouseLeave={() => setTimeout(() => setShowControls(false), 3000)}
                    >
                      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-300 mb-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                          <div 
                            ref={progressRef}
                            className="w-full bg-gray-600 rounded-full h-2 cursor-pointer relative"
                            onClick={handleProgressClick}
                          >
                            <div className="absolute inset-0 bg-gray-600 rounded-full"></div>
                            <div 
                              className="absolute left-0 top-0 h-full bg-red-500 rounded-full transition-all"
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                            <div 
                              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full shadow-lg cursor-pointer transition-all hover:scale-110"
                              style={{ left: `calc(${progressPercentage}% - 8px)` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" onClick={togglePlay} className="hover:bg-white/20">
                              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                            
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={toggleMute} className="hover:bg-white/20">
                                {isMuted ? (
                                  <VolumeX className="w-4 h-4 text-red-400" />
                                ) : volume > 0.5 ? (
                                  <Volume2 className="w-4 h-4" />
                                ) : (
                                  <Volume1 className="w-4 h-4" />
                                )}
                              </Button>
                              
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => adjustVolume(parseFloat(e.target.value))}
                                className="w-20 h-2 bg-gray-600 rounded-lg cursor-pointer"
                              />
                              <span className="text-xs w-10 text-center">
                                {Math.round((isMuted ? 0 : volume) * 100)}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="hover:bg-white/20">
                              {isFullscreen ? <Minimize className="w-4 h-4 text-blue-400" /> : <Maximize className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" className="hover:bg-white/20">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-400">Select an episode to play</div>
            )}
          </div>
        </div>

        <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-lg font-semibold mb-2">Plot of Episode {currentEpisode?.episodeNum || 1}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {titleData?.synopsis || "During Eric and Grace's wedding anniversary party, Grace's stepsister Amanda suddenly appears and demands that Grace give Eric back to her, shocking everyone at the party..."}
            </p>
            <Button variant="link" className="text-red-500 p-0 h-auto text-sm">More</Button>
          </div>

          <div className="p-4 border-b border-gray-800">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-gray-800 text-gray-300">Sentimental</Badge>
              <Badge className="bg-gray-800 text-gray-300">Emotional</Badge>
              <Badge className="bg-gray-800 text-gray-300">USA</Badge>
              <Badge className="bg-gray-800 text-gray-300">Hospital</Badge>
              <Badge className="bg-gray-800 text-gray-300">Mansion</Badge>
              <Badge className="bg-gray-800 text-gray-300">Office</Badge>
            </div>
          </div>

          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <button className="px-3 py-1 text-sm font-medium border-b-2 border-red-500 text-red-500">
                  0 - 49
                </button>
              </div>
              <Button variant="link" className="text-gray-400 text-sm p-0">All Episodes ›</Button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-6 gap-2">
              <button className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center text-xs font-medium text-gray-300 hover:bg-gray-700">
                Trailer
              </button>
              
              {titleData.episodes.slice(0, 50).map((episode) => (
                <button
                  key={episode.id}
                  className={`relative aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all hover:scale-105 ${
                    currentEpisode?.id === episode.id
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/50' 
                      : episode.isFree 
                        ? 'bg-gray-700 text-white hover:bg-gray-600' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => handleEpisodeClick(episode)}
                >
                  {episode.episodeNum}
                  {!episode.isFree && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <Lock className="w-2 h-2 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && selectedEpisode && (
        <PaymentModal 
          episode={selectedEpisode}
          title={titleData}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  )
}

// 完整的ReelShort风格支付弹窗组件
function PaymentModal({ episode, title, onClose }: { 
  episode: Episode, 
  title: TitleData, 
  onClose: () => void 
}) {
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card'>('paypal')
  const [loading, setLoading] = useState(false)
  const [coinPackages, setCoinPackages] = useState<any[]>([])
  const [loadingPackages, setLoadingPackages] = useState(true)

  // 从API获取真实的充值套餐数据
  useEffect(() => {
    fetchPaymentPackages()
  }, [])

  const fetchPaymentPackages = async () => {
    try {
      const { getPaymentTiers } = await import('@/lib/pay')
      const data = await getPaymentTiers()
      
      if (data && data.packages) {
        const formattedPackages = data.packages.map((pkg: any) => ({
          id: pkg.id,
          coins: pkg.coins,
          bonus: pkg.bonus,
          price: pkg.price,
          discount: pkg.discount,
          isNewUser: pkg.isNewUser,
          name: pkg.name,
          description: pkg.description,
          bgColor: pkg.isNewUser ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gray-700',
          badgeColor: pkg.isNewUser ? 'bg-yellow-500 text-black' : 'bg-orange-500 text-white'
        }))
        setCoinPackages(formattedPackages)
      } else {
        // 使用默认数据
        setCoinPackages([
          {
            id: 'coins_300',
            coins: 300,
            bonus: 50,
            price: 4.99,
            discount: '+17%',
            isNewUser: false,
            bgColor: 'bg-gray-700',
            badgeColor: 'bg-orange-500 text-white'
          }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error)
      setCoinPackages([])
    } finally {
      setLoadingPackages(false)
    }
  }

  const handlePayment = async () => {
    if (!selectedPackage) {
      alert('Please select a coin package first')
      return
    }

    // 检查用户是否已登录
    const userId = localStorage.getItem('userId')
    if (!userId) {
      alert('Please login first to make a payment')
      // 跳转到登录页面
      window.location.href = '/login'
      return
    }

    setLoading(true)
    try {
      // 使用新的 tier_key 和 userId 格式
      const payload = {
        tierKey: selectedPackage.id,
        userId: userId
      }

      if (paymentMethod === 'paypal') {
        // 使用PayPal支付
        const { startPayPalCheckout } = await import('@/lib/pay')
        await startPayPalCheckout(payload)
      } else {
        // 使用Stripe支付
        const { startStripeCheckout } = await import('@/lib/pay')
        await startStripeCheckout(payload)
      }
      
      onClose()
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment error occurred: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden bg-gray-900 border-gray-700 text-white">
        <CardHeader className="pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-xl">Unlock subsequent episodes</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 overflow-y-auto flex-1" style={{maxHeight: 'calc(90vh - 180px)'}}>
          <div className="text-center space-y-2">
            <div className="text-lg font-semibold text-gray-300">
              Price: {episode.priceCoins} Coins or {episode.priceCoins} Bonuses
            </div>
            <div className="text-gray-400">
              Coin Balance: 0 Coins | 0 Bonus
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Top Up</h3>

            {loadingPackages ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading packages...</div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 首充套餐 - 突出显示 */}
                {coinPackages.filter(pkg => pkg.isNewUser).map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`bg-gray-800 rounded-lg p-4 relative cursor-pointer border-2 transition-all hover:scale-[1.02] ${
                      selectedPackage?.id === pkg.id 
                        ? 'border-yellow-400 ring-4 ring-yellow-400/30 bg-yellow-900/20' 
                        : 'border-yellow-400'
                    }`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    {/* 火焰形状的+100%徽章 */}
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
                        +{Math.round((pkg.bonus / pkg.coins) * 100)}%
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* 金币图标 */}
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-yellow-800 font-bold text-lg">R</span>
                        </div>
                        <div>
                          <div className="text-gray-300 text-sm">NEW USER ONLY</div>
                          <div className="text-white text-2xl font-bold">
                            {pkg.coins} Coins + {pkg.bonus} Bonus
                          </div>
                        </div>
                      </div>
                      
                      {/* 价格 */}
                      <div className="ml-auto text-right">
                        <div className="text-white text-2xl font-bold">${pkg.price}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 普通套餐网格 */}
                <div className="grid grid-cols-3 gap-3">
                  {coinPackages.filter(pkg => !pkg.isNewUser).map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`bg-gray-700 rounded-lg p-3 text-center relative cursor-pointer border-2 transition-all hover:scale-105 ${
                        selectedPackage?.id === pkg.id 
                          ? 'border-yellow-400 ring-4 ring-yellow-400/30 bg-yellow-900/20' 
                          : 'border-transparent hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      {pkg.discount && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {pkg.discount}
                          </div>
                        </div>
                      )}
                      <div className={pkg.discount ? 'mt-2' : ''}>
                        <div className="text-white text-lg font-bold">{pkg.coins}</div>
                        {pkg.bonus > 0 ? (
                          <div className="text-gray-300 text-xs">+{pkg.bonus} Bonus</div>
                        ) : (
                          <div className="text-gray-400 text-xs">Coins</div>
                        )}
                        <div className="text-white text-sm font-semibold mt-2">${pkg.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Payment Method</h3>
            <div className="flex gap-3">
              <div 
                className={`flex-1 border-2 rounded-lg p-3 cursor-pointer transition-all ${
                  paymentMethod === 'paypal' ? 'border-red-500 bg-blue-900' : 'border-gray-600 bg-gray-800'
                }`}
                onClick={() => setPaymentMethod('paypal')}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                  <span className="text-white text-sm font-medium">PayPal</span>
                </div>
              </div>
              <div 
                className={`flex-1 border-2 rounded-lg p-3 cursor-pointer transition-all ${
                  paymentMethod === 'card' ? 'border-red-500 bg-blue-900' : 'border-gray-600 bg-gray-800'
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="w-6 h-6 text-white" />
                  <span className="text-white text-sm font-medium">Credit Card</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <Button 
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 text-lg rounded-lg transition-all"
            onClick={handlePayment}
            disabled={loading || !selectedPackage}
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

