# NewTube

A modern, full-stack video sharing platform built with cutting-edge technologies. Share, discover, and engage with video content in a seamless experience.

**Live Demo:** https://newtube-ruddy.vercel.app/

---

## Features

### 🎬 Advanced Video Player with Quality Controls
A custom-built video player powered by Mux that supports multiple quality levels, playback speed controls, full-screen mode, picture-in-picture, and keyboard shortcuts for an enhanced viewing experience.

### 📝 Real-time Video Processing with Mux
Seamless video upload and processing pipeline using Mux's professional video infrastructure. Videos are automatically transcoded, optimized for streaming, and delivered via Mux's global CDN for fast playback worldwide.

### 🖼️ Smart Thumbnail Generation
AI-powered thumbnail generation that automatically creates engaging preview images from video frames. Creators can select the best auto-generated thumbnail or upload custom ones to maximize click-through rates.

### 🤖 AI-Powered Title and Description Generation
Intelligent content analysis that suggests optimized titles and descriptions based on video content, helping creators improve discoverability and engagement with minimal effort.

### 📊 Creator Studio with Metrics
A comprehensive dashboard for content creators featuring video performance analytics, view counts, engagement metrics, subscriber growth charts, and revenue insights. Track your channel's performance in real-time.

### 🗂️ Custom Playlist Management
Create, organize, and share custom playlists. Features include:
- Public and private playlist visibility
- Drag-and-drop video ordering
- Automatic "Watch Later" playlist
- Liked videos playlist
- Watch history tracking

### 📱 Responsive Design Across Devices
A fully responsive interface that adapts perfectly to desktop, tablet, and mobile devices. Enjoy the same feature-rich experience whether you're on a big screen or on-the-go.

### 🔄 Multiple Content Feeds
Diverse content discovery with multiple curated feeds:
- **Home Feed:** Personalized recommendations based on your interests
- **Trending Feed:** Popular videos across the platform
- **Subscriptions Feed:** Latest videos from channels you follow
- **Search:** Find videos by keywords, channels, or categories

### 💬 Interactive Comment System
Engage with the community through threaded comments with:
- Nested replies (up to 2 levels deep)
- Like/dislike reactions on comments
- Comment sorting (newest, oldest, top)
- Real-time comment counts

### 👍 Like and Subscription System
Express your appreciation for content with likes and grow your audience with subscriptions. Get notified when favorite creators upload new content.

### 🎯 Watch History Tracking
Automatically track your viewing history so you can easily find videos you've watched before. Never lose track of interesting content again.

### 🔐 Authentication System
Secure authentication powered by Clerk with:
- Email/password and social login
- Two-factor authentication support
- Session management
- User profile customization

### 📦 Module-Based Architecture
Clean, maintainable codebase organized into feature modules:
- Each module contains its own server procedures, UI components, and types
- Easy to add, modify, or remove features
- Clear separation of concerns

---

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with Server Components
- **TailwindCSS v4** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible components
- **tRPC Client** - End-to-end type-safe APIs

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **tRPC** - Type-safe API layer
- **DrizzleORM** - Type-safe database queries
- **PostgreSQL** (Neon) - Cloud-native database

### Integrations
- **Mux** - Video streaming and processing
- **Uploadthing** - File uploads
- **Clerk** - Authentication
- **Upstash** - Rate limiting and Redis caching

---

## Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Authentication routes
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (home)/              # Main application routes
│   │   ├── videos/[videoId]/    # Video watch page
│   │   ├── users/[userId]/      # User profile page
│   │   ├── search/              # Search page
│   │   ├── subscriptions/       # Subscriptions page
│   │   ├── feed/                # Content feeds
│   │   │   ├── trending/
│   │   │   └── subscribed/
│   │   └── playlists/           # Playlist management
│   │       ├── [playlistId]/
│   │       ├── liked/
│   │       └── history/
│   ├── (studio)/             # Creator studio routes
│   │   └── studio/
│   │       ├── page.tsx         # Dashboard
│   │       └── videos/[videoId]/ # Video editor
│   └── api/                  # API routes
│       ├── trpc/
│       ├── uploadthing/
│       └── videos/
│
├── components/               # Shared UI components
│   └── ui/                   # shadcn/ui components
│
├── db/                       # Database layer
│   ├── index.ts              # Database connection
│   └── schema.ts             # Drizzle schema
│
├── hooks/                    # Custom React hooks
│
├── lib/                      # Utilities and integrations
│   ├── utils.ts              # Helper functions
│   ├── mux.ts                # Mux integration
│   ├── uploadthing.ts        # Uploadthing config
│   ├── redis.ts               # Redis client
│   └── ratelimit.ts          # Rate limiting
│
├── modules/                  # Feature modules
│   ├── videos/               # Video player & management
│   │   ├── server/           # tRPC procedures
│   │   └── ui/               # UI components
│   ├── users/                # User profiles
│   ├── comments/             # Comment system
│   ├── playlists/            # Playlist management
│   ├── subscriptions/         # Subscription system
│   ├── studio/               # Creator studio
│   ├── search/               # Search functionality
│   ├── home/                 # Home page & navigation
│   ├── categories/           # Video categories
│   ├── suggestions/           # Recommendation engine
│   ├── video-reactions/      # Like/dislike system
│   ├── comment-reactions/    # Comment reactions
│   └── video-views/          # View tracking
│
├── trpc/                     # tRPC configuration
│   ├── routers/              # API routers
│   ├── init.ts               # Initialization
│   └── client.tsx           # Client setup
│
└── styles/                   # Global styles
    └── globals.css
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (Neon recommended)
- Mux account for video processing
- Uploadthing account for file uploads
- Clerk account for authentication
- Upstash account for rate limiting

### Environment Variables

Create a `.env.local` file with:

```env
# Database
DATABASE_URL=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Mux
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=

# Uploadthing
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/newtube.git
cd newtube

# Install dependencies
npm install

# Set up the database
npm run db:generate
npm run db:push

# Seed categories (optional)
npm run db:seed

# Start the development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run db:generate   # Generate Drizzle migrations
npm run db:push       # Push schema to database
npm run db:seed       # Seed database with categories
```

---

## API Architecture

The application uses tRPC for type-safe API communication:

| Router | Description |
|--------|-------------|
| `videos` | Video CRUD, search, suggestions |
| `users` | User profiles, settings |
| `comments` | Comment management |
| `playlists` | Playlist CRUD operations |
| `subscriptions` | Channel subscriptions |
| `studio` | Creator tools, uploads |
| `categories` | Video categories |
| `videoViews` | View tracking |
| `videoReactions` | Like/dislike videos |
| `commentReactions` | Like/dislike comments |
| `suggestions` | Content recommendations |

---

## Database Schema

Core tables:
- `users` - User accounts and profiles
- `videos` - Video metadata and Mux IDs
- `comments` - Video comments with threading
- `playlists` - User playlists
- `playlistVideos` - Playlist-video relationships
- `subscriptions` - Channel subscriptions
- `categories` - Video categories
- `videoViews` - View records
- `videoReactions` - Like/dislike records
- `commentReactions` - Comment reaction records

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## License

MIT License - see LICENSE file for details.

---

**Built with ❤️ using Next.js, tRPC, Drizzle ORM, and Mux**
