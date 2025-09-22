# Dramini Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 14)                │
├─────────────────────────────────────────────────────────────┤
│  App Router Pages                                            │
│  ├── / (Homepage)                                           │
│  ├── /browse (Browse dramas)                                │
│  ├── /title/[slug] (Show details)                           │
│  ├── /watch/[slug]/[ep] (Video player)                      │
│  ├── /pay (Payment plans)                                    │
│  └── /account/* (User management)                           │
├─────────────────────────────────────────────────────────────┤
│  Components                                                  │
│  ├── Header (Sticky navigation)                             │
│  ├── Hero (Homepage banner)                                 │
│  ├── PosterCard (9:16 drama cards)                          │
│  ├── Carousel (Draggable content)                            │
│  ├── PaywallModal (Payment unlock)                          │
│  └── Player (Video player)                                  │
├─────────────────────────────────────────────────────────────┤
│  Libraries                                                   │
│  ├── api.ts (Mock API layer)                                │
│  ├── analytics.ts (Event tracking)                         │
│  ├── pay.ts (Payment integration)                           │
│  └── a11y.ts (Accessibility helpers)                       │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Stripe    │  │   PayPal    │  │   Notion    │        │
│  │  (Payments) │  │  (Payments) │  │ (Database)  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Google OAuth│  │ Apple OAuth │  │Facebook OAuth│        │
│  │(Authentication)│(Authentication)│(Authentication)│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Google      │  │ Google      │  │   AWS S3    │        │
│  │ Analytics   │  │ Tag Manager │  │ (Storage)   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 📱 Responsive Design Strategy

### Mobile First Approach
- **Base**: Mobile layout (320px+)
- **Breakpoints**: 
  - `sm`: 640px (Large phones)
  - `md`: 768px (Tablets)
  - `lg`: 1024px (Small desktops)
  - `xl`: 1280px (Large desktops)

### Layout Adaptations
```
Mobile (< 640px):
├── Single column layout
├── Horizontal scrolling carousels
├── Touch-friendly interactions
└── Simplified navigation

Tablet (640px - 1024px):
├── 2-3 column grids
├── Hybrid touch/mouse interactions
├── Collapsible sidebars
└── Medium-sized components

Desktop (> 1024px):
├── 3-6 column grids
├── Hover effects and animations
├── Full navigation menus
└── Large interactive elements
```

## 🎬 Video Player Architecture

### Player Features
- **Aspect Ratio**: 9:16 (Vertical)
- **Controls**: Touch/mouse/keyboard
- **Streaming**: Adaptive bitrate
- **Offline**: Download support
- **Accessibility**: Screen reader support

### Player States
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Loading   │───▶│   Playing   │───▶│   Paused    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Error    │    │   Buffering │    │   Ended     │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 💳 Payment Flow

### Payment Options
1. **Single Episode**: $0.99 per episode
2. **Full Season**: $9.99 per season
3. **VIP Monthly**: $19.99/month
4. **VIP Yearly**: $199.99/year (17% savings)

### Payment Process
```
User clicks "Unlock" 
    ↓
PaywallModal opens
    ↓
User selects plan
    ↓
Redirect to Stripe/PayPal
    ↓
Payment processing
    ↓
Success callback
    ↓
Content unlocked
```

## 📊 Analytics Implementation

### Event Categories
- **Navigation**: Page views, route changes
- **Content**: Poster clicks, video plays
- **Commerce**: Payment attempts, completions
- **Engagement**: Time spent, interactions

### Data Flow
```
User Action → Analytics Event → dataLayer → GA4/GTM → Dashboard
```

## ♿ Accessibility Features

### WCAG 2.1 AA Compliance
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and descriptions
- **Color Contrast**: 4.5:1 minimum ratio
- **Focus Management**: Visible focus indicators

### Implementation Examples
```typescript
// Focus trapping
const cleanup = trapFocus(modalElement);

// Screen reader announcements
announceToScreenReader('Content loaded successfully');

// Keyboard navigation
handleArrowKeys(event, items, currentIndex, 'horizontal');
```

## 🚀 Performance Optimization

### Core Web Vitals Targets
- **LCP**: ≤ 2.5 seconds
- **FID**: ≤ 100 milliseconds
- **CLS**: ≤ 0.05

### Optimization Strategies
- **Image Optimization**: Next.js Image with WebP/AVIF
- **Code Splitting**: Route-based lazy loading
- **Caching**: Static generation where possible
- **Bundle Analysis**: Regular size monitoring

## 🔒 Security Measures

### Frontend Security
- **CSP**: Content Security Policy headers
- **XSS Protection**: Input sanitization
- **CSRF Protection**: SameSite cookies

### Data Protection
- **Environment Variables**: Sensitive data in .env
- **API Keys**: Server-side only
- **User Data**: Encrypted storage

## 🧪 Testing Strategy

### Test Types
- **Unit Tests**: Component logic
- **Integration Tests**: API interactions
- **E2E Tests**: User workflows
- **Accessibility Tests**: WCAG compliance

### Testing Tools
- **Jest**: Unit testing
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **axe-core**: Accessibility testing

## 📈 Monitoring & Observability

### Metrics Tracked
- **Performance**: Core Web Vitals
- **Errors**: JavaScript errors, API failures
- **User Behavior**: Navigation patterns, engagement
- **Business**: Conversion rates, revenue

### Tools Used
- **Vercel Analytics**: Performance monitoring
- **Sentry**: Error tracking
- **Google Analytics**: User behavior
- **Stripe Dashboard**: Payment metrics

## 🔄 Deployment Pipeline

### Development Workflow
```
Feature Branch → Pull Request → Code Review → Merge → Deploy
```

### Deployment Targets
- **Development**: Local development server
- **Staging**: Preview deployments
- **Production**: Vercel production environment

## 📚 Documentation Standards

### Code Documentation
- **JSDoc**: Function documentation
- **TypeScript**: Type definitions
- **README**: Setup and usage
- **Architecture**: System overview

### API Documentation
- **OpenAPI**: API specifications
- **Examples**: Usage examples
- **Error Codes**: Error handling
- **Rate Limits**: Usage limits

