# Dramini - Vertical Short Drama Platform

A modern web platform for streaming bite-size vertical short dramas, built with Next.js 14, TypeScript, and Tailwind CSS.

## 🎬 Features

- **Responsive Design**: PC and mobile adaptive with dark theme
- **Vertical Video Player**: Optimized for 9:16 aspect ratio content
- **Payment Integration**: Stripe and PayPal SDK integration points
- **Analytics**: Comprehensive event tracking with GA4/GTM support
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **Performance**: Optimized for Core Web Vitals (LCP ≤ 2.5s, CLS ≤ 0.05)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dramini
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Edit `.env.local` with your configuration values.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
dramini/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Global layout with Header/Footer
│   ├── page.tsx           # Homepage (/)
│   ├── browse/            # Browse page (/browse)
│   ├── top/               # Top charts (/top)
│   ├── categories/        # Categories page (/categories)
│   ├── title/[slug]/      # Show detail pages (/title/:slug)
│   ├── watch/[slug]/[ep]/ # Video player pages (/watch/:slug/:ep)
│   ├── pay/               # Payment page (/pay)
│   └── account/           # User account pages (/account/*)
├── components/            # Reusable React components
│   ├── ui/                # Base UI components (Button, Card, etc.)
│   ├── Header.tsx         # Sticky navigation header
│   ├── Hero.tsx           # Homepage hero section
│   ├── PosterCard.tsx     # 9:16 drama poster cards
│   ├── Carousel.tsx       # Draggable content carousel
│   ├── CategoryChips.tsx  # Category filter chips
│   ├── PaywallModal.tsx   # Payment unlock modal
│   ├── PlanPicker.tsx     # Subscription plan selection
│   └── Footer.tsx         # Site footer
├── lib/                   # Utility libraries
│   ├── api.ts             # Mock API functions
│   ├── analytics.ts       # Event tracking utilities
│   ├── pay.ts             # Payment integration
│   ├── a11y.ts            # Accessibility helpers
│   └── utils.ts           # General utilities
├── types/                 # TypeScript type definitions
│   └── index.ts           # Core data models
└── public/                # Static assets
    └── posters/           # Drama poster images
```

## 🎨 Design System

### Colors
- **Background**: `#0F0F10` (Dark theme)
- **Primary**: `#E50914` (Netflix red)
- **Secondary**: `#FFD54A` (Gold accent)
- **Text**: `#F3F4F6` (Light gray)
- **Muted**: `#A3A3AD` (Medium gray)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold weights (600-700)
- **Body**: Regular weight (400)

### Components
- **Cards**: 16px border radius, subtle shadows
- **Buttons**: Primary, secondary, ghost variants
- **Posters**: 9:16 aspect ratio, hover effects
- **Modals**: Backdrop blur, smooth animations

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env.local` and configure:

```bash
# Required
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Dramini

# Database (Notion Integration)
NOTION_API_KEY=your_notion_api_key_here
NOTION_DATABASE_ID=your_notion_database_id_here

# Payment Integration
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=your_paypal_client_id_here

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

### Tailwind Configuration

The project uses a custom Tailwind config with:
- Dark theme colors
- Custom animations
- Extended spacing and typography
- Component-specific utilities

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

### Layout Adaptations
- **Mobile**: Single column, horizontal scrolling
- **Tablet**: 2-3 column grids
- **Desktop**: 3-6 column grids with hover effects

## 🎯 Analytics & Tracking

### Event Tracking
All user interactions are tracked with `data-ev` attributes:

```typescript
// Hero CTA clicks
analytics.heroCtaClick('watch', 'hero');

// Poster interactions  
analytics.posterClick(titleId, index, section);

// Payment events
analytics.checkoutStart(plan, price);
analytics.checkoutSuccess(plan, price, paymentId);
```

### Google Analytics 4
- Page views
- Custom events
- E-commerce tracking
- User engagement metrics

## 💳 Payment Integration

### Stripe Checkout
```typescript
const result = await createStripeCheckout(planId, userId);
if (result.success) {
  window.location.href = result.redirectUrl;
}
```

### PayPal SDK
```typescript
const result = await createPayPalPayment(planId, userId);
if (result.success) {
  window.location.href = result.redirectUrl;
}
```

## ♿ Accessibility

### WCAG 2.1 AA Compliance
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and descriptions
- **Color Contrast**: 4.5:1 minimum ratio
- **Focus Management**: Visible focus indicators

### Implementation
```typescript
// Focus trapping for modals
const cleanup = trapFocus(modalElement);

// Screen reader announcements
announceToScreenReader('Content loaded successfully');

// Keyboard navigation
handleArrowKeys(event, items, currentIndex, 'horizontal');
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript compiler
```

### Code Style
- **ESLint**: Airbnb configuration
- **Prettier**: Consistent formatting
- **TypeScript**: Strict mode enabled
- **Conventional Commits**: Standardized commit messages

## 📊 Performance

### Core Web Vitals Targets
- **LCP**: ≤ 2.5 seconds
- **FID**: ≤ 100 milliseconds  
- **CLS**: ≤ 0.05

### Optimization Strategies
- **Image Optimization**: Next.js Image component with WebP/AVIF
- **Code Splitting**: Route-based lazy loading
- **Caching**: Static generation where possible
- **Bundle Analysis**: Regular bundle size monitoring

## 🔒 Security

### Security Headers
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **Referrer-Policy**: origin-when-cross-origin

### Data Protection
- **Input Validation**: Server-side validation
- **XSS Protection**: Content Security Policy
- **CSRF Protection**: SameSite cookies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@dramini.com or join our Discord community.

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing React framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Framer Motion**: For smooth animations
- **Lucide React**: For beautiful icons

---

**Made with ❤️ for drama lovers**

