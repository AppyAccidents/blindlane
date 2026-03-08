# 🤖 Agent Guidelines for BlindLane

> Instructions for AI agents working on the BlindLane codebase

---

## 📋 Mandatory Workflow

### Rule #1: READ FIRST

**Before making ANY changes, you MUST read these files in order:**

1. **AGENTS.md** (this file) - Understand the workflow
2. **PRD.md** - Product requirements and vision
3. **README.md** - Project overview and setup
4. **ROADMAP.md** - Current status and planned features
5. **DESIGN.md** - UI/UX design system
6. **.env.example** - Required environment variables
7. **package.json** - Dependencies and scripts

### Rule #2: DOCS LAST

**After making code changes, you MUST update documentation:**

1. Update **PRD.md** if:
   - Product features change
   - Scope expands or contracts
   - New capabilities added

2. Update **README.md** if:
   - New features added
   - API changes made
   - Setup instructions changed
   - Environment variables modified

3. Update **ROADMAP.md** if:
   - Features completed (move from "In Progress" to "Completed")
   - New phases/features planned
   - Technical debt items resolved
   - Architecture changes made

4. Update **AGENTS.md** if:
   - New patterns established
   - Workflow changes
   - Additional context needed for future agents

---

## 🏗️ Product Context

### What is BlindLane?

BlindLane is an **editor-first content creation platform** with an Arena mode for comparing AI-generated drafts. It helps creators and teams:

1. **Generate** multiple content drafts from multiple LLMs (2-32 drafts)
2. **Compare** drafts anonymously in a gallery or side-by-side view
3. **Evaluate** with AI-powered tagging and scoring
4. **Converge** on a winner that becomes the working draft
5. **Publish** platform-ready content (LinkedIn, X, Email, Blog, Newsletter)

### Product Philosophy

**"Quality certainty without bias"**

- Users pick based on content quality, not model brand
- AI evaluator helps decide faster without picking for you
- Winner becomes editable draft, not final output
- Platform-native formatting reduces publishing friction

### Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  WORKSPACE (Editor-First UI)                                │
│  ┌──────────┬─────────────────────────┬──────────────────┐ │
│  │ Left     │ Center                  │ Right (Arena)    │ │
│  │ Rail     │ Editor                  │                  │ │
│  │          │                         │ Gallery /        │ │
│  │ • Work-  │ Prompt Input            │ Compare          │ │
│  │   space  │ Working Draft           │ Draft Cards      │ │
│  │ • Client │                         │ Evaluator Chips  │ │
│  │ • Brand  │                         │ Vote Actions     │ │
│  │   Kit    │                         │                  │ │
│  │ • Camp-  │                         │ Converge →       │ │
│  │   aign   │                         │ Reveal           │ │
│  └──────────┴─────────────────────────┴──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   OpenAI API    │ │ Anthropic API   │ │   Supabase      │
│  GPT-4o Mini    │ │ Claude 3.5      │ │  PostgreSQL     │
│                 │ │   Haiku         │ │  + Edge Config  │
│                 │ │                 │ │  + Realtime     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui primitives (default token contract) |
| Database | Supabase (PostgreSQL) |
| AI APIs | OpenAI, Anthropic (expandable to 8+ models) |
| Icons | Lucide React |
| Deployment | Vercel |

### Key Design Decisions

1. **Editor-First UI**
   - Users live in the editor, not a comparison tool
   - Arena is a mode, not a separate page
   - Three-zone layout: Navigation | Editor | Arena

2. **Arena Pattern**
   - Gallery view: grid of draft cards with evaluator chips
   - Compare view: side-by-side with linked scrolling
   - Converge: winner becomes working draft, others discarded

3. **Anonymous Drafts**
   - Drafts labeled A, B, C, D (not model names)
   - Model identity revealed only after converge
   - Eliminates brand bias in selection

4. **Variant System**
   - Intentional angles: concise, story-driven, contrarian, empathetic
   - Same variants across all models for fair comparison
   - Templates, not random temperature

5. **Evaluator AI**
   - Separate from generation models
   - Tags and scores to help users decide faster
   - Never reveals model identities

6. **Platform-Ready Output**
   - LinkedIn, X, Email, Blog, Newsletter formats
   - Native formatting applied automatically
   - Still editable before publish

---

## 📝 Code Patterns

### Draft Generation Pattern

```typescript
// Generate multiple variants across multiple models
const generateDrafts = async (prompt: string, config: GenerationConfig) => {
  const { models, variants } = config;
  
  // Create all generation promises
  const generationPromises = models.flatMap(model => 
    variants.map(variant => 
      generateWithVariant(model, prompt, variant)
    )
  );
  
  // Run in parallel with timeout
  const results = await Promise.allSettled(
    generationPromises.map(p => withTimeout(p, 15000))
  );
  
  // Return anonymous drafts
  return results
    .filter((r): r is PromiseFulfilledResult<Draft> => r.status === 'fulfilled')
    .map((r, i) => ({
      id: generateDraftId(i), // A, B, C, D...
      content: r.value.content,
      model: r.value.model,     // Hidden until reveal
      variant: r.value.variant, // Hidden until reveal
      cost: r.value.cost,
      latency: r.value.latency,
    }));
};
```

### Evaluator Pattern

```typescript
// Evaluate drafts without revealing identities
const evaluateDrafts = async (drafts: Draft[]) => {
  const evaluations = await Promise.all(
    drafts.map(async draft => {
      const scores = await evaluator.score(draft.content);
      
      return {
        draftId: draft.id,     // A, B, C, D
        tags: scores.tags,     // tone, angle, audience
        clarity: scores.clarity,
        humanFeel: scores.humanFeel,
        platformFit: scores.platformFit,
        clusterId: scores.similarityCluster,
        // NO model identity here!
      };
    })
  );
  
  // Generate shortlist and diversity view
  return {
    evaluations,
    shortlist: pickTopPicks(evaluations, 3),
    diversitySet: pickDiverseAngles(evaluations),
  };
};
```

### UI Component Pattern

```typescript
// Draft Card with Evaluator Chips
<DraftCard
  draft={draft}
  evaluation={evaluation}
  onSelect={handleSelect}
  isSelected={selectedId === draft.id}
  isRevealed={phase === 'revealed'}
/>

// Compare View
<CompareView
  drafts={selectedDrafts}
  evaluations={evaluations}
  onVote={handleVote}
  linkedScrolling={true}
/>
```

Prefer `components/ui/*` primitives as the default building blocks for new panel work. Add wrapper components only when composition repeats across 3+ locations.

### Converge Pattern

```typescript
// Converge: winner becomes working draft
const converge = (winnerId: string, drafts: Draft[]) => {
  const winner = drafts.find(d => d.id === winnerId);
  const discarded = drafts.filter(d => d.id !== winnerId);
  
  return {
    workingDraft: {
      content: winner.content,
      model: winner.model,      // Now revealed
      variant: winner.variant,  // Now revealed
      cost: winner.cost,
    },
    discarded,                   // Collapse to drawer
  };
};
```

---

## 🗺️ Current Development Status

### Phase 1: MVP Core (In Progress)

**Goal**: Prove the editor + Arena + converge loop works

- ✅ Editor-first layout (left/center/right zones)
- ✅ 2 LLMs (GPT-4o Mini, Claude 3.5 Haiku)
- ✅ 2 variants (concise, story-driven) = 4 drafts
- ✅ Gallery view (2×2 grid)
- ✅ Compare view (2-up side-by-side)
- ✅ Converge action
- 🔄 Evaluator-lite (tags, basic scores)
- 🔄 Platform formatting (LinkedIn, Email)
- 🔄 Reveal panel
- ⏸️ Publishing export

### Phase 2: Enhanced Arena (Planned)

- 8 LLMs support
- 4 variants = 32 drafts
- Progressive gallery loading
- Filters and clustering
- 3-up compare view
- Keyboard shortcuts

### Phase 3: Agency Mode (Planned)

- Multi-client workspaces
- Brand kits
- Campaigns
- Approvals workflow
- Comments and history

### Phase 4: Full Platform (Future)

- All platform formats
- Scheduling and integrations
- Analytics
- API for agencies

---

## ⚠️ Important Constraints

### Cost Control

- **NEVER** increase default draft counts without cost analysis
- **NEVER** remove per-run spend caps
- **ALWAYS** parallelize generation to reduce latency
- **ALWAYS** implement timeouts and graceful degradation

Current limits:
- MVP: 4 drafts max
- Per-run cap: configurable (default $1)
- Daily user cap: configurable (default $10)

### Quality Standards

- **NEVER** show raw model output without formatting
- **ALWAYS** detect and cluster near-duplicates
- **ALWAYS** maintain consistent variants across models
- **ALWAYS** preserve editor state during Arena mode switches

### Security

- **NEVER** expose model identities before converge
- **NEVER** cache drafts without retention policy
- **ALWAYS** validate user input
- **ALWAYS** use supabaseAdmin in API routes

---

## 🧪 Testing Requirements

### Rule #3: TEST EVERYTHING IMPORTANT

**Every code change MUST include appropriate tests.**

#### Test Coverage Requirements

| Priority | What to Test | Coverage Target |
|----------|--------------|-----------------|
| **P0** | Draft generation | 100% |
| **P0** | Evaluator scoring | 100% |
| **P0** | Utility functions (`lib/utils.ts`) | 100% |
| **P1** | Arena state management | 90%+ |
| **P1** | Platform formatting | All formats |
| **P1** | API route handlers | Core logic 90%+ |
| **P2** | React components | Critical UI paths |

#### Test File Locations

```
__tests__/
├── unit/
│   ├── lib/
│   │   ├── utils.test.ts
│   │   ├── generation.test.ts
│   │   └── evaluator.test.ts
│   ├── arena/
│   │   ├── gallery.test.ts
│   │   ├── compare.test.ts
│   │   └── converge.test.ts
│   └── formats/
│       ├── linkedin.test.ts
│       ├── email.test.ts
│       └── x.test.ts
├── integration/
│   └── api/
│       ├── drafts.test.ts
│       ├── evaluate.test.ts
│       └── converge.test.ts
└── setup.ts
```

#### Running Tests

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
```

---

## 🧪 Pre-Commit Checklist

- [ ] Code compiles without errors (`npm run build`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Lint passes (`npm run lint`)
- [ ] **All tests pass (`npm test`)**
- [ ] New tests added for new code
- [ ] Documentation updated (Rule #2)
- [ ] Cost implications considered
- [ ] Arena state transitions work correctly

---

## 🤝 Handoff Notes

If you are an AI agent completing work on this project:

1. **Summarize what you did** in your final response
2. **Note any incomplete work** clearly
3. **List files modified** with brief change descriptions
4. **Update documentation** as required by Rule #2
5. **Flag cost implications** of changes
6. **Document Arena state changes** if applicable

---

## 🔍 Quick Reference

### File Locations

| Purpose | Path |
|---------|------|
| Arena components | `app/arena/` |
| Editor components | `app/editor/` |
| Evaluator | `lib/evaluator.ts` |
| Formatters | `lib/formats/` |
| Draft generation | `lib/generation.ts` |
| Types | `types/index.ts` |

### Key Environment Variables

```bash
OPENAI_API_KEY              # Required
ANTHROPIC_API_KEY           # Required
NEXT_PUBLIC_SUPABASE_URL    # Required
NEXT_PUBLIC_SUPABASE_ANON_KEY # Required
SUPABASE_SERVICE_ROLE_KEY   # Required
ARENA_MVP_V2                # Feature flag for Arena MVP v2
DAILY_BUDGET_LIMIT          # Default: 10
RATE_LIMIT_PER_IP           # Default: 10
MAX_PROMPT_LENGTH           # Default: 1000
API_TIMEOUT_SECONDS         # Default: 15
MAX_CONCURRENT_GENERATIONS_GLOBAL # Default: 20
MAX_CONCURRENT_GENERATIONS_PER_IP # Default: 3
```

### Common Commands

```bash
npm run dev              # Development server
npm run build            # Production build
npm test                 # Run tests
npm run test:coverage    # Coverage report
```

---

## 📞 Getting Help

If you're an AI agent and something is unclear:

1. Check **PRD.md** for product context
2. Check **ROADMAP.md** for feature status
3. Check **DESIGN.md** for UI patterns
4. Look at existing code for patterns
5. When in doubt, ask the user for clarification

---

**Remember**: This is an editor-first product. The Arena is a mode, not the main feature. Users live in the editor and use the Arena to improve their drafts.

---

*Last updated: March 2026*  
*Version: v0.2.0 - Editor-First Arena*
