# 🎯 BlindLane

> The Pepsi Challenge for AI - Compare GPT-4o Mini vs Claude 3.5 Haiku anonymously

BlindLane is a blind comparison tool for AI language models. Enter a prompt, two AI models respond anonymously, and you vote for the better one—without brand bias.

![BlindLane Screenshot](https://placeholder-for-screenshot.png)

## ✨ Features

- 🤖 **Two Models**: GPT-4o Mini vs Claude 3.5 Haiku
- 🎲 **Random Assignment**: Models are randomly assigned A/B labels
- 🗳️ **Blind Voting**: Vote before seeing which model is which
- 📊 **Leaderboard**: See which model users prefer overall
- 💰 **Cost Transparency**: See exactly how much each comparison costs
- 🚫 **Rate Limiting**: 10 comparisons per day per IP
- 📱 **Mobile Responsive**: Works on all devices

## 🚀 Quick Start (For Non-Technical Founders)

Don't worry if you've never coded before. I'll walk you through everything step by step.

### Prerequisites

You'll need:
- A Mac or Windows computer
- A GitHub account (free)
- A Vercel account (free)
- A Supabase account (free tier)
- API keys from OpenAI and Anthropic (they give you free credits to start)

### Step 1: Set Up Your Development Environment

#### On Mac:

1. **Install Homebrew** (package manager):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Node.js** (JavaScript runtime):
   ```bash
   brew install node
   ```

3. **Install Git** (version control):
   ```bash
   brew install git
   ```

4. **Install VS Code** (code editor):
   - Download from: https://code.visualstudio.com/
   - Install the "ES7+ React/Redux/React-Native snippets" extension

#### On Windows:

1. **Install Node.js**:
   - Download from: https://nodejs.org/en/download/
   - Choose the LTS version

2. **Install Git**:
   - Download from: https://git-scm.com/download/win

3. **Install VS Code**:
   - Download from: https://code.visualstudio.com/

### Step 2: Get Your API Keys

#### OpenAI API Key

1. Go to https://platform.openai.com/signup
2. Create an account (you get $5 in free credits)
3. Go to https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key (you won't see it again!)

#### Anthropic API Key

1. Go to https://console.anthropic.com/
2. Create an account (you get $5 in free credits)
3. Go to Settings → API Keys
4. Click "Create Key"
5. Copy the key

### Step 3: Set Up Supabase (Database)

1. Go to https://supabase.com/
2. Sign up with GitHub
3. Click "New Project"
4. Name it "blindlane"
5. Choose a region close to your users (e.g., US East)
6. Click "Create new project"
7. Wait for the project to be created (~2 minutes)

#### Get Your Supabase Keys:

1. In your Supabase dashboard, click the "Connect" button
2. Click "App frameworks"
3. Copy:
   - `SUPABASE_URL` (looks like: https://abcdefg123456.supabase.co)
   - `SUPABASE_ANON_KEY` (long string of letters and numbers)

#### Set Up the Database:

1. In Supabase, go to the "SQL Editor" (left sidebar)
2. Click "New query"
3. Copy the contents of `supabase/migrations/001_initial_schema.sql` from this repo
4. Paste it into the SQL Editor
5. Click "Run"
6. You should see "Success" in the output

### Step 4: Deploy to Vercel

#### Option A: One-Click Deploy (Easiest)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AppyAccidents/blindlane)

1. Click the button above
2. Sign in with GitHub
3. Vercel will:
   - Clone the repo to your GitHub
   - Deploy it automatically
   - Give you a URL

#### Option B: Manual Deploy

1. Push this code to your own GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/blindlane.git
   git push -u origin main
   ```

2. Go to https://vercel.com/
3. Sign up with GitHub
4. Click "Add New Project"
5. Import your `blindlane` repo
6. Click "Deploy"

### Step 5: Configure Environment Variables

After deploying, you need to add your API keys:

1. In Vercel, go to your project
2. Click "Settings" → "Environment Variables"
3. Add these variables one by one:

| Name | Value | Where to Find |
|------|-------|---------------|
| `OPENAI_API_KEY` | sk-... | OpenAI dashboard |
| `ANTHROPIC_API_KEY` | sk-ant-... | Anthropic console |
| `NEXT_PUBLIC_SUPABASE_URL` | https://... | Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJ... | Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJ... | Supabase dashboard → Project Settings → API |
| `DAILY_BUDGET_LIMIT` | 10 | Just type "10" |
| `RATE_LIMIT_PER_IP` | 10 | Just type "10" |
| `MAX_PROMPT_LENGTH` | 1000 | Just type "1000" |
| `API_TIMEOUT_SECONDS` | 15 | Just type "15" |

4. Click "Save"
5. Click "Redeploy" (or push a small change to trigger a new deploy)

### Step 6: Test Your App

1. Go to your Vercel URL (e.g., https://blindlane.vercel.app)
2. Enter a prompt like "Explain quantum computing"
3. Click "Compare"
4. Wait for both responses
5. Vote for the better one
6. See the reveal!

## 💰 Cost Control

### Understanding Costs

Each comparison costs approximately:
- **GPT-4o Mini**: ~$0.0001 - $0.001 per comparison
- **Claude 3.5 Haiku**: ~$0.0002 - $0.002 per comparison

With the $10 daily budget limit:
- You can handle ~5,000-10,000 comparisons per day
- That's plenty for an MVP!

### Budget Safety Features

The app has multiple safety features:
1. **Daily budget limit** (hard stop at $10)
2. **Rate limiting** (10 comparisons per IP per day)
3. **Max prompt length** (1000 characters)
4. **API timeout** (15 seconds)
5. **Token limits** (1000 tokens per response)

### Setting Up Billing Alerts

#### OpenAI:
1. Go to https://platform.openai.com/settings/organization/billing/overview
2. Click "Usage limits"
3. Set "Hard limit" to $100/month

#### Anthropic:
1. Go to https://console.anthropic.com/settings/billing
2. Set a monthly limit of $100

## 🛠️ Development Guide

### Running Locally

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/blindlane.git
   cd blindlane
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Edit `.env.local` with your API keys

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000 in your browser

### Project Structure

```
blindlane/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   ├── comparison/    # Main comparison API
│   │   │   ├── route.ts
│   │   │   └── vote/
│   │   │       └── route.ts
│   │   └── stats/         # Leaderboard stats API
│   │       └── route.ts
│   ├── leaderboard/       # Leaderboard page
│   │   └── page.tsx
│   ├── about/            # About page
│   │   └── page.tsx
│   ├── page.tsx          # Home page (main UI)
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── lib/                   # Utility functions
│   ├── utils.ts
│   ├── supabase.ts
│   └── constants.ts
├── types/                 # TypeScript types
│   └── index.ts
├── supabase/             # Database migrations
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/               # Static files
├── package.json          # Dependencies
├── next.config.mjs       # Next.js config
├── tailwind.config.ts    # Tailwind CSS config
└── README.md             # This file
```

### Key Concepts Explained

#### Why Next.js?

Next.js is a React framework that makes it easy to build fast, SEO-friendly web apps. Think of it as:
- **React**: The library for building user interfaces
- **Next.js**: The framework that adds server-side rendering, routing, and API routes

#### What is an API Route?

An API route is a special file in Next.js that handles server-side logic. When you call `/api/comparison`, it runs code on the server (not in the browser) that:
1. Receives your prompt
2. Calls OpenAI and Anthropic APIs
3. Returns the responses

This keeps your API keys secret (they never go to the browser).

#### What is Supabase?

Supabase is a "backend-as-a-service" that gives you:
- PostgreSQL database (stores comparisons, votes)
- Authentication (user login)
- Real-time subscriptions
- Serverless functions

Think of it as a more developer-friendly Firebase.

#### What is Promise.all?

In `app/api/comparison/route.ts`, we use `Promise.all` to call both APIs at the same time:

```typescript
const [resultA, resultB] = await Promise.all([
  callModel(modelA, prompt),  // Call OpenAI
  callModel(modelB, prompt),  // Call Anthropic
]);
```

This is like sending two letters at the same time instead of waiting for the first to arrive before sending the second. Much faster!

## 🚨 Troubleshooting

### "Module not found" errors

Run:
```bash
npm install
```

### "API key invalid" errors

1. Double-check your environment variables in Vercel
2. Make sure you've redeployed after adding them
3. Verify the keys are correct (no extra spaces)

### Database connection errors

1. Check that you ran the SQL migration in Supabase
2. Verify your Supabase URL and keys are correct
3. Make sure your Supabase project is active (not paused)

### Rate limit exceeded

The app limits users to 10 comparisons per day per IP. This is expected behavior to control costs.

### "Build failed" on Vercel

1. Check the build logs in Vercel
2. Make sure all environment variables are set
3. Try redeploying

## 📈 Monitoring Your App

### Vercel Analytics

1. Go to your project in Vercel
2. Click "Analytics" tab
3. See how many visitors you have

### Supabase Usage

1. Go to your Supabase dashboard
2. Click "Database" → "Usage"
3. Monitor database size and connections

### API Usage

#### OpenAI:
https://platform.openai.com/usage

#### Anthropic:
https://console.anthropic.com/settings/usage

## 🔒 Security Best Practices

1. **Never commit `.env.local`** - It contains your API keys
2. **Rotate API keys** every 90 days
3. **Monitor usage** regularly for unexpected spikes
4. **Set hard limits** on API spending
5. **Enable 2FA** on all accounts (GitHub, Vercel, Supabase, OpenAI, Anthropic)

## 🎯 Next Steps (After MVP)

Once you have users and want to add more features:

1. **Add more models**: GPT-4, Claude Opus, Gemini, etc.
2. **User accounts**: Let users see their history
3. **Share results**: Let users share comparisons on Twitter/X
4. **Categories**: Tag comparisons (coding, writing, analysis)
5. **Comments**: Let users explain why they voted
6. **API**: Let other developers use your comparison data
7. **Mobile app**: Build a React Native app

## 🤝 Getting Help

If you're stuck:

1. **Check the logs**:
   - Vercel: Project → Deployments → Latest → Functions
   - Browser: Press F12 → Console tab

2. **Google the error** - copy and paste the error message

3. **Ask ChatGPT/Claude** - paste your code and error

4. **Open an issue** on this GitHub repo

## 📄 License

MIT License - feel free to use this for your own projects!

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/)
- [OpenAI](https://openai.com/)
- [Anthropic](https://anthropic.com/)

---

**Happy comparing!** 🎉

Remember: The goal isn't to find the "best" model—it's to find the best model *for your specific use case*.
