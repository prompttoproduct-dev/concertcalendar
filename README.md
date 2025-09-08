# CitySounds NYC - Concert Discovery Platform

A genre-first concert discovery platform for NYC's music scene. Find emerging artists, free concerts, and genre-specific shows across all five boroughs.

## 🎵 Features

- **Genre-First Discovery**: Explore NYC's music scene by genre
- **Free Concert Finder**: Never miss free shows across all 5 boroughs
- **New Release Tracking**: See which artists with new albums are touring NYC
- **Real-time Updates**: Get notified when new concerts are added
- **Manual Curation**: Community-driven concert additions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- API keys for Ticketmaster and Eventbrite (optional)

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd concert-discovery-nyc-mvp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your environment variables in `.env.local`:
   - Supabase URL and keys
   - API keys for Ticketmaster and Eventbrite

5. Start the development server:
```bash
npm run dev
```

## 🏗️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **APIs**: Ticketmaster Discovery API, Eventbrite API
- **Deployment**: Vercel
- **State Management**: TanStack Query (React Query)

## 📁 Project Structure

```
├── .agents/                 # Development essentials and quick hits
├── docs/                    # Comprehensive documentation
│   └── front-end/          # Frontend-specific documentation
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Route components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utilities and configurations
├── lib/
│   ├── supabase.ts        # Supabase client and types
│   └── api-clients/       # External API clients
└── public/                # Static assets
```

## 🎯 Development Workflow

1. Check the [Task List](docs/TASK_LIST.md) for current development priorities
2. Follow the [Development Essentials](.agents/development-essentials.md) for quick hits
3. Refer to [Frontend Documentation](docs/front-end/) for detailed guidelines

## 🔧 Environment Variables

See `.env.example` for all required environment variables. Key variables include:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `TICKETMASTER_API_KEY`: Ticketmaster Discovery API key
- `EVENTBRITE_API_KEY`: Eventbrite API key

## 🚀 Deployment

The project is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📊 Success Metrics

- Concert discovery rate (new artists found per user session)
- Free concert attendance tracking
- Genre exploration patterns
- User engagement with new releases

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the coding standards in the documentation
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.