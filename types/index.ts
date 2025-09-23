export interface Poster {
  id: string
  title: string
  poster: string
  cover?: string
  slug: string
  year?: number
  rating?: number
  duration?: string
  description?: string
  // 添加实际数据库字段
  name?: string // 对应 mainTitle
  synopsis?: string // 对应 subTitle
  coverImageId?: string // 对应 coverUrl
  status?: string // 对应 isOnline
}

export interface Category {
  id: string
  name: string
  slug: string
  movies: Poster[]
}

export interface BrowseData {
  movies: Poster[]
  categories: Category[]
  total: number
  page: number
  limit: number
}

export interface CarouselProps {
  items: Poster[]
  title?: string
  section?: string
  className?: string
  itemsPerView?: number
  showNavigation?: boolean
}

export interface PaymentPlan {
  id: string
  name: string
  price: number
  priceCents: number
  features: string[]
  popular?: boolean
  type?: 'single' | 'season' | 'monthly' | 'yearly'
}

export interface PaymentResult {
  success: boolean
  sessionId?: string
  error?: string
}

export interface UserCoin {
  id: string
  amount: number
}

export interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  title: {
    id: string
    name: string
  }
  episode?: number
  onUnlock?: (type: 'single' | 'season' | 'vip') => void
  message?: string
  plans?: PaymentPlan[]
  onPlanSelect?: (planId: string) => void
  onCheckout?: (planId: string) => void
}

export interface PlanPickerProps {
  plans: PaymentPlan[]
  selectedPlan?: string
  onPlanSelect: (planId: string) => void
  onCheckout: (planId: string) => void
}

export interface PosterCardProps {
  poster: Poster
  className?: string
  showOverlay?: boolean
  index?: number
  section?: string
  onWatch?: (poster: Poster) => void
  onUnlock?: (poster: Poster) => void
  onPlay?: (poster: Poster) => void
  onLock?: (poster: Poster) => void
}

export interface AnalyticsEvent {
  type: string
  data: any
  timestamp: number
}

export interface Title {
  id: string
  name: string // 主字段
  slug: string
  synopsis?: string
  coverImageId?: string
  status: string // DRAFT/PUBLISHED
  language: string
  createdAt: string
  updatedAt: string
  // 前端期望的字段（通过映射获得）
  mainTitle?: string // 映射自 name
  subTitle?: string // 映射自 synopsis
  coverUrl?: string // 映射自 coverImageId
  isOnline?: boolean // 映射自 status === 'PUBLISHED'
}
