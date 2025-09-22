// Core data models
export interface Poster {
  id: string;
  slug: string;
  title: string;
  cover: string; // 9:16 aspect ratio image URL
  locked?: boolean;
  badges?: string[];
  rating?: number;
  category?: string;
  episodes?: number;
  freeEpisodes?: number;
  isVip?: boolean;
}

export interface Episode {
  ep: number;
  title: string;
  duration: number; // in seconds
  locked: boolean;
  priceCents?: number;
  thumbnail?: string;
}

export interface Title {
  id: string;
  slug: string;
  title: string;
  cover: string;
  tags: string[];
  description: string;
  episodes: Episode[];
  rating?: number;
  category?: string;
  isVip?: boolean;
}

// API response types
export interface HomepageData {
  hero: {
    title: string;
    subtitle: string;
    cta1: { text: string; href: string };
    previewImage: string;
  };
  trending: Poster[];
  categories: Category[];
  howItWorks: Step[];
  why: Feature[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Step {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// User and subscription types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  subscription?: Subscription;
  watchHistory?: WatchHistory[];
}

export interface Subscription {
  id: string;
  plan: 'monthly' | 'yearly' | 'single' | 'season';
  status: 'active' | 'cancelled' | 'expired';
  expiresAt: string;
  priceCents: number;
}

export interface WatchHistory {
  titleId: string;
  episode: number;
  progressSec: number;
  lastWatched: string;
}

// Payment types
export interface PaymentPlan {
  id: string;
  name: string;
  type: 'single' | 'season' | 'monthly' | 'yearly';
  priceCents: number;
  features: string[];
  popular?: boolean;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
  redirectUrl?: string;
}

// Analytics types
export interface AnalyticsEvent {
  event: string;
  [key: string]: any;
}

// Component props types
export interface PosterCardProps {
  poster: Poster;
  index?: number;
  section?: string;
  onWatch?: (poster: Poster) => void;
  onUnlock?: (poster: Poster) => void;
}

export interface CarouselProps {
  items: Poster[];
  title?: string;
  showNavigation?: boolean;
  itemsPerView?: number;
}

export interface CategoryChipsProps {
  categories: string[];
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: Title;
  episode?: number;
  onUnlock: (type: 'single' | 'season' | 'vip') => void;
}

export interface PlanPickerProps {
  plans: PaymentPlan[];
  selectedPlan?: string;
  onPlanSelect: (planId: string) => void;
  onCheckout: (planId: string) => void;
}

// API function types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  message?: string;
}

export interface UnlockRequest {
  userId: string;
  titleId: string;
  ep?: number;
  season?: boolean;
}

export interface UnlockResponse {
  ok: boolean;
  unlockedItems: string[];
}

export interface SubscribeRequest {
  userId: string;
  plan: string;
}

export interface SubscribeResponse {
  ok: boolean;
  plan: string;
  expiresAt: string;
}

export interface WatchRecordRequest {
  userId: string;
  titleId: string;
  ep: number;
  progressSec: number;
}

// Global type declarations
declare global {
  interface Window {
    dataLayer?: any[];
  }
}

// Utility types
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl';
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'es' | 'fr' | 'de';

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}
