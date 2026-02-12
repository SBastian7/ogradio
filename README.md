# OG Club Radio - Live Streaming Platform

A modern, elegant radio streaming website with real-time chat and community-driven song requests.

## Features

- **Live Radio Streaming** - High-quality audio streaming from OG Club
- **Real-time Chat** - Instant messaging with other listeners
- **Song Requests** - Community upvoting system for song requests
- **Anonymous Access** - Start listening immediately, sign in optionally
- **Social Authentication** - Sign in with Google, Discord, or GitHub
- **Glassmorphism + Brutalism Design** - Unique modern aesthetic
- **Rich Animations** - Smooth transitions and micro-interactions
- **Mobile Responsive** - Works on all devices

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Real-time:** Supabase Realtime
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for Phase 2)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Supabase credentials (after Phase 2 setup).

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
app/
├── src/
│   ├── app/              # Next.js app router pages
│   │   └── api/          # API routes
│   ├── components/       # React components
│   │   ├── player/       # Audio player components
│   │   ├── chat/         # Chat components
│   │   ├── requests/     # Song request components
│   │   └── ui/           # Shared UI components
│   ├── lib/              # Utilities and helpers
│   ├── hooks/            # Custom React hooks
│   └── styles/           # Global styles
├── public/               # Static assets
└── ...config files
```

## Implementation Phases

- [x] **Phase 1:** Project Setup & Foundation ✅
- [ ] **Phase 2:** Supabase Backend Configuration
- [ ] **Phase 3:** Design System & Shared UI Components
- [ ] **Phase 4:** Authentication System
- [ ] **Phase 5:** Audio Player & Visualizer
- [ ] **Phase 6:** Chat System
- [ ] **Phase 7:** Song Request & Upvoting System
- [ ] **Phase 8:** Additional Features & Polish
- [ ] **Phase 9:** Accessibility & SEO
- [ ] **Phase 10:** Performance Optimization
- [ ] **Phase 11:** Testing & Quality Assurance
- [ ] **Phase 12:** Deployment & Launch

## Design Document

See [docs/plans/2026-02-10-radio-streaming-website-design.md](../docs/plans/2026-02-10-radio-streaming-website-design.md) for the complete design specification.

## License

Private project for OG Club Radio.
