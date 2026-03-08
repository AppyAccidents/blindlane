# 🎯 BlindLane

> **Blind taste testing for content. Arena UX. Editor-first UI.**

BlindLane is an editor-first content creation platform that helps creators and teams generate multiple AI drafts, compare them anonymously, and publish platform-ready content.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AppyAccidents/blindlane)

---

## ✨ What is BlindLane?

Traditional AI writing tools make you pick a model first. BlindLane turns that around:

1. **Write your prompt** in the editor
2. **Generate 4 drafts** from multiple AI models (anonymously)
3. **Compare in the Arena** — gallery view or side-by-side
4. **Evaluate with AI** — tags and scores help you decide faster
5. **Converge on a winner** — model identities revealed after you choose
6. **Publish ready content** — formatted for LinkedIn, X, Email, Blog, Newsletter

**The key insight**: When you don't know which model wrote what, you choose based on quality, not brand bias.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Git
- API keys: [OpenAI](https://platform.openai.com/api-keys) & [Anthropic](https://console.anthropic.com/settings/keys)
- [Supabase](https://supabase.com/) account (free tier)

### One-Click Deploy (Vercel)

1. Click the **Deploy with Vercel** button above
2. Connect your GitHub account
3. Add environment variables
4. Deploy!

### Local Development

```bash
# 1. Clone the repo
git clone https://github.com/AppyAccidents/blindlane.git
cd blindlane

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Set up Supabase database
# Run the SQL in supabase/migrations/001_initial_schema.sql

# 5. Run the development server
npm run dev

# 6. Open http://localhost:3000
```

---

## 🎨 The Editor + Arena Pattern

BlindLane uses a three-zone workspace:

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER                                                      │
├──────────┬─────────────────────────┬─────────────────────────┤
│          │                         │                         │
│  LEFT    │       CENTER            │        RIGHT            │
│  RAIL    │       EDITOR            │        ARENA            │
│          │                         │                         │
│  • Work- │  ┌─────────────────┐   │  ┌─────────────────┐   │
│    space  │  │ Prompt Input    │   │  │ GALLERY VIEW    │   │
│  • Client │  │                 │   │  │                 │   │
│  • Brand  │  │ [Generate ▼]    │   │  │ Draft A  Draft B│   │
│    Kit    │  └─────────────────┘   │  │ Draft C  Draft D│   │
│  • Camp-  │                         │  │                 │   │
│    aign   │  ┌─────────────────┐   │  │ [Compare Mode]  │   │
│  • History│  │ Working Draft   │   │  │                 │   │
│          │  │ (after converge)│   │  └─────────────────┘   │
│          │  └─────────────────┘   │                         │
└──────────┴─────────────────────────┴─────────────────────────┘
```

### Arena Modes

**Gallery View**: Grid of draft cards with evaluator chips (tone, clarity, platform fit)

**Compare View**: Side-by-side comparison with linked scrolling

**Converge**: Select winner → model identities revealed → winner becomes working draft

---

## 🏗️ Architecture

### Draft Generation

```
User Prompt
     ↓
[2 LLMs] × [2 Variants] = 4 Drafts
     ↓
Anonymous Drafts (A, B, C, D)
     ↓
Evaluator AI (tags, scores)
     ↓
Arena (Gallery/Compare)
     ↓
Converge (Winner selected)
     ↓
Reveal (Model identity shown)
     ↓
Editor (Working draft)
     ↓
Platform Format (LinkedIn, X, Email, etc.)
```

### Variants System

Each draft uses an intentional angle:

| Variant | Style | Use Case |
|---------|-------|----------|
| Concise | Direct, punchy | Quick updates, announcements |
| Story-driven | Narrative hook | Engagement, emotional connection |
| Contrarian | Counter-intuitive | Thought leadership |
| Empathetic | Warm, human | Support, community building |

### Evaluator AI

A separate AI model scores drafts without revealing identities:

- **Tags**: Tone, angle, audience, industry fit
- **Scores**: Clarity, human feel, platform fit (0-100)
- **Clustering**: Groups near-duplicates
- **Shortlist**: "Top pick" and "Runner-up" badges

---

## 💻 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui primitives (default token contract) |
| Database | Supabase (PostgreSQL) |
| AI APIs | OpenAI, Anthropic |
| Icons | Lucide React |
| Deployment | Vercel |

---

## ⚙️ Environment Variables

```bash
# Required API Keys
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Cost Control
MAX_DRAFTS_PER_RUN=4          # MVP: 4 drafts max
PER_RUN_SPEND_CAP=1.0         # Max $ per generation
DAILY_USER_SPEND_CAP=10.0     # Max $ per user per day
```

---

## 🧪 Testing

We use Jest and React Testing Library.

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

See [TESTING.md](./TESTING.md) for detailed testing documentation.

---

## 🗺️ Roadmap

### MVP (Current)

- ✅ Editor-first three-zone layout
- ✅ 2 LLMs × 2 variants = 4 drafts
- ✅ Gallery view (2×2 grid)
- ✅ Compare view (2-up side-by-side)
- ✅ Converge action
- 🔄 Evaluator-lite (tags, scores)
- 🔄 Platform formatting (LinkedIn, Email)
- 🔄 Reveal panel

### Phase 2: Enhanced Arena

- 8 LLMs support
- 4 variants = 32 drafts
- Progressive gallery loading
- Filters and clustering
- 3-up compare view
- Keyboard shortcuts

### Phase 3: Agency Mode

- Multi-client workspaces
- Brand kits (voice, banned phrases, examples)
- Campaigns and content calendars
- Approvals workflow
- Comments and version history

### Phase 4: Full Platform

- All platform formats (X, Blog, Newsletter)
- Scheduling and integrations
- Analytics and performance tracking
- API for agencies

---

## 📊 Success Metrics

We're building toward:

- **Convergence rate**: % of runs where user picks a winner within 3 minutes
- **Publish rate**: % of converged drafts that get published
- **Repeat usage**: Users returning within 7 days
- **Time savings**: User-reported time reduction in content creation
- **Cost efficiency**: Average cost per quality content piece

---

## 📄 Documentation

| Document | Purpose |
|----------|---------|
| [PRD.md](./PRD.md) | Product requirements and vision |
| [AGENTS.md](./AGENTS.md) | Guidelines for AI agents working on the codebase |
| [ROADMAP.md](./ROADMAP.md) | Detailed development roadmap |
| [DESIGN.md](./DESIGN.md) | UI/UX design system |
| [TESTING.md](./TESTING.md) | Testing documentation |

---

## 🤝 Contributing

1. Read [AGENTS.md](./AGENTS.md) first
2. Fork the repository
3. Create a feature branch: `git checkout -b feature/arena-compare`
4. Commit changes: `git commit -m 'Add 3-up compare view'`
5. Push to branch: `git push origin feature/arena-compare`
6. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/)
- [OpenAI](https://openai.com/)
- [Anthropic](https://anthropic.com/)

---

**Quality certainty without bias.** 🎯

*Last Updated: March 2026*

---

## March 2026 MVP Update

Implemented Arena MVP v2 flow:

- Editor-first layout with Arena gallery + compare + converge flow
- 2 models × 2 variants = 4 anonymous drafts
- Evaluator-lite tags/scores + shortlist labels
- Reveal data only after converge (model/variant/cost/latency/tokens)
- Formatting endpoints for LinkedIn and Email with copyable output

### API Endpoints (Current)

- `POST /api/comparison` -> generate run preview (`run` + `comparePairs`)
- `POST /api/comparison/vote` -> record pair vote (`BETTER_A`, `BETTER_B`, `TIE`, `SKIP`)
- `POST /api/comparison/converge` -> converge winner + reveal payload
- `POST /api/format` -> platform formatting (`linkedin`, `email`)

### Added Environment Variables

- `ARENA_MVP_V2`
- `MAX_CONCURRENT_GENERATIONS_GLOBAL`
- `MAX_CONCURRENT_GENERATIONS_PER_IP`

### Testing Additions

- Unit: generation, evaluator, arena reducer, LinkedIn formatter, Email formatter
- Integration: comparison, vote, converge, format, stats
- Type gate: `npm run typecheck`
