# Santiago Ramírez — Portfolio & Lead Generation Landing

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · React Three Fiber · next-intl (ES/EN) · Vercel Analytics

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (fonts, analytics)
│   ├── sitemap.ts              # Auto sitemap for SEO
│   └── [locale]/
│       ├── layout.tsx          # i18n provider + metadata
│       └── page.tsx            # Main page (composes sections)
├── components/
│   ├── 3d/
│   │   └── ProjectDevice.tsx   # 3D floating phone (R3F)
│   ├── sections/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── PainPoints.tsx
│   │   ├── Differentiator.tsx
│   │   ├── Testimonials.tsx
│   │   ├── ProjectsShowcase.tsx  # Tabs + 3D device per project
│   │   ├── Process.tsx
│   │   ├── Automation.tsx
│   │   ├── Services.tsx
│   │   ├── RiskReversal.tsx
│   │   ├── FinalCta.tsx
│   │   └── Footer.tsx
│   └── ui/
│       ├── Reveal.tsx          # Scroll reveal animation
│       ├── CtaButton.tsx       # Reusable CTA
│       ├── SectionHeading.tsx
│       ├── WhatsAppFloat.tsx
│       ├── LanguageSwitcher.tsx
│       └── JsonLd.tsx          # Structured data for SEO
├── i18n/
│   ├── routing.ts              # Locale config
│   ├── request.ts              # Server config
│   └── messages/
│       ├── es.json             # Spanish copy
│       └── en.json             # English copy
├── lib/
│   ├── constants.ts            # WA links, project data, types
│   └── utils.ts                # cn() helper
└── styles/
    └── globals.css             # Tailwind + custom utilities
```

## Key Features

### 3D Project Showcase
Each project shows a floating 3D phone mockup (React Three Fiber + Drei) with:
- Project-colored screen glow
- Floating particles matching project color
- Smooth rotation animation
- Lazy-loaded with suspense fallback

### i18n (Spanish / English)
- `next-intl` with App Router
- URL-based: `/` = Spanish, `/en` = English
- All copy in JSON files — easy to edit
- SEO metadata per locale with alternates

### CRO Optimized
- 7 strategic CTAs with different WhatsApp pre-filled messages
- Pain points section before solution (Problem → Agitation → Solution)
- Risk reversal section
- Scarcity badge ("Solo 2 cupos")
- UTM detection for ad traffic

### SEO
- Per-locale metadata + Open Graph
- JSON-LD structured data
- Sitemap with hreflang alternates
- robots.txt

### Performance
- Vercel Analytics + Speed Insights
- 3D component lazy-loaded
- Tailwind for minimal CSS
- Next.js optimized images (when screenshots added)
- Turbopack for dev

## Deploy to Vercel

```bash
npx vercel
```

No environment variables needed. Analytics auto-configures on Vercel.

## Customization

### Add project screenshots
Drop images in `public/images/` and update `screenshots` array in `src/lib/constants.ts`.

### Edit copy
All text lives in `src/i18n/messages/es.json` and `en.json`. Edit and save — changes are instant in dev.

### Change WhatsApp number
Update `WA_NUMBER` in `src/lib/constants.ts`.

### Change accent color
Update the `accent` color tokens in `tailwind.config.ts` and CSS variables in `globals.css`.
