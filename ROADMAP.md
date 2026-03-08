# 🎯 BlindLane Roadmap

> Blind taste testing for content. Arena UX. Editor-first UI.

---

## 📋 Table of Contents

1. [Product Vision](#product-vision)
2. [Current Status](#current-status)
3. [MVP (Phase 1)](#mvp-phase-1)
4. [Phase 2: Enhanced Arena](#phase-2-enhanced-arena)
5. [Phase 3: Agency Mode](#phase-3-agency-mode)
6. [Phase 4: Full Platform](#phase-4-full-platform)
7. [Technical Debt](#technical-debt)
8. [Appendix](#appendix)

---

## Product Vision

BlindLane is an **editor-first content creation platform** with an Arena mode for comparing AI-generated drafts.

### Core Loop

```
Prompt → Generate (4-32 drafts) → Evaluate → Compare → Converge → Edit → Publish
```

### Key Principles

1. **Editor-First**: Users live in the editor, Arena is a mode
2. **Anonymous Drafts**: Choose by quality, not brand
3. **Evaluator AI**: Tags and scores to speed up decisions
4. **Converge Pattern**: Winner becomes working draft
5. **Platform-Ready**: Native formatting for LinkedIn, X, Email, etc.

---

## Current Status

### MVP Core - IN PROGRESS (Q1 2026)

**Goal**: Prove the editor + Arena + converge loop works

**Scope**: 2 LLMs × 2 variants = 4 drafts

| Feature | Status | Notes |
|---------|--------|-------|
| Three-zone layout | ✅ | Left rail / Center editor / Right Arena |
| Editor components | ✅ | Prompt input, working draft |
| Arena gallery | ✅ | 2×2 draft grid |
| Arena compare | ✅ | 2-up side-by-side |
| Converge action | ✅ | Winner → working draft |
| shadcn UI migration (user + admin panels) | ✅ | Pure shadcn defaults and primitive composition across routes |
| Evaluator-lite | 🔄 | Tags, basic scores |
| Platform formatting | 🔄 | LinkedIn, Email |
| Reveal panel | 🔄 | Model identity after converge |
| Publish export | ⏸️ | Copy, Markdown |
| Auth & billing | ⏸️ | Basic subscription |

**Success Metrics**:
- % of runs where user converges within 3 minutes
- Publish/export rate
- Repeat usage within 7 days
- Average cost per run

---

## MVP (Phase 1)

### 1.1 Editor Foundation ✅

**Layout Implementation**
- [x] Three-zone workspace (Left rail / Center editor / Right Arena)
- [x] Responsive breakpoints
- [x] Standardized shadcn token contract
- [x] Glassmorphism card design
- [x] shadcn/ui panel primitives for user/admin surfaces

**Left Rail Navigation**
- [x] Workspace selector
- [x] Client/Brand kit (UI only)
- [x] Campaign/History (UI only)

**Center Editor**
- [x] Prompt input with character counter
- [x] Generate button with loading states
- [x] Working draft area (converge target)

### 1.2 Arena Core ✅

**Gallery View**
- [x] 2×2 draft card grid
- [x] Anonymous labeling (A, B, C, D)
- [x] Card hover effects
- [x] Click to expand full text

**Compare View**
- [x] 2-up side-by-side layout
- [x] Linked scrolling
- [x] Vote actions (Better A / Better B / Tie / Skip)
- [x] Smooth transitions between views

**Converge Flow**
- [x] Winner selection
- [x] Discard other drafts to drawer
- [x] Winner populates working draft
- [x] Trigger reveal panel

### 1.3 Draft Generation ✅

**Models & Variants**
- [x] 2 LLMs: GPT-4o Mini, Claude 3.5 Haiku
- [x] 2 variants: Concise, Story-driven
- [x] Parallel generation with Promise.all
- [x] Timeout handling (15s)
- [x] Cost tracking per draft

**Variant System**
- [x] Template-based variants (not random temp)
- [x] Consistent prompts across models
- [x] Variant metadata storage

### 1.4 Evaluator AI (Lite) 🔄

**Per Draft Scoring**
- [ ] Tone detection tag
- [ ] Angle identification
- [ ] Clarity score (0-100)
- [ ] Human feel score (0-100)
- [ ] Platform fit score (0-100)
- [ ] Basic duplicate detection

**Global Outputs**
- [ ] "Top pick" badge
- [ ] "Runner-up" badge
- [ ] Shortlist generation

### 1.5 Platform Formatting 🔄

**LinkedIn Format**
- [ ] Hook line detection
- [ ] Proper spacing (line breaks)
- [ ] CTA suggestions
- [ ] Optional hashtag recommendations

**Email Format**
- [ ] Subject line options
- [ ] Preview text generation
- [ ] Body formatting

**Export Options**
- [ ] Copy to clipboard
- [ ] Markdown export

### 1.6 Reveal Panel 🔄

**Post-Converge Display**
- [ ] Model identity (GPT-4o Mini / Claude 3.5 Haiku)
- [ ] Variant used (concise / story-driven)
- [ ] Token usage
- [ ] Cost breakdown
- [ ] Latency (generation time)

---

## Phase 2: Enhanced Arena

**Timeline**: Q2 2026  
**Goal**: Scale to 32 drafts with intelligent filtering

### 2.1 Expanded Model Support

**Model Pool**
- [ ] 8 LLMs support
  - GPT-4o, GPT-4o Mini
  - Claude 3.5 Sonnet, Claude 3.5 Haiku
  - Gemini Pro
  - Llama 3 (via Groq)
  - Mistral Large
  - Additional providers
- [ ] Model pool presets (Frontier, Fast, Budget, Brand-safe)
- [ ] Per-model timeout configuration

### 2.2 Full Variant System

**4 Variants**
- [ ] Concise (direct, punchy)
- [ ] Story-driven (narrative, emotional)
- [ ] Contrarian (counter-intuitive, spicy)
- [ ] Empathetic (warm, human, supportive)

**Variant Management**
- [ ] Custom variant templates
- [ ] Variant preview
- [ ] A/B variant testing

### 2.3 Enhanced Gallery

**32-Draft Grid**
- [ ] Progressive loading (load first 8, then rest)
- [ ] Virtual scrolling for performance
- [ ] Pin important drafts
- [ ] Bulk selection actions

**Filtering & Sorting**
- [ ] Filter by tone tag
- [ ] Filter by score range
- [ ] Sort by clarity, human feel, platform fit
- [ ] Search within drafts

**Clustering**
- [ ] Group near-duplicates
- [ ] Collapse/expand clusters
- [ ] "Show diverse angles" toggle
- [ ] Similarity score display

### 2.4 Advanced Compare

**Multi-Up Views**
- [ ] 2-up (existing)
- [ ] 3-up option
- [ ] Swap drafts in compare view

**UX Improvements**
- [ ] Keyboard shortcuts (1, 2, 3 to vote)
- [ ] Linked scroll speed matching
- [ ] Highlight differences mode
- [ ] "Open in editor" preview without breaking comparison

### 2.5 Full Evaluator

**Rich Scoring**
- [ ] Audience fit score
- [ ] Industry fit tags
- [ ] Engagement prediction with explanation
- [ ] SEO score (for blog/newsletter)
- [ ] Readability metrics
- [ ] Risk detection (claims, compliance)

**Intelligence**
- [ ] Embedding-based similarity clustering
- [ ] Diversity view (distinct angles only)
- [ ] "What's missing" suggestions
- [ ] Recommended follow-up prompts

---

## Phase 3: Agency Mode

**Timeline**: Q3 2026  
**Goal**: Multi-client workflow for agencies

### 3.1 Workspace & Client Management

**Workspaces**
- [ ] Team workspaces
- [ ] Client separation
- [ ] Workspace switching

**Client Profiles**
- [ ] Client branding
- [ ] Industry classification
- [ ] Target audience notes

### 3.2 Brand Kits

**Voice & Tone**
- [ ] Voice notes (descriptive)
- [ ] Tone examples (sample content)
- [ ] Do's and don'ts list

**Guardrails**
- [ ] Banned phrases
- [ ] Required phrases
- [ ] Claims rules (what can be asserted)
- [ ] Compliance notes

### 3.3 Campaigns

**Campaign Structure**
- [ ] Campaign creation
- [ ] Prompt sets per campaign
- [ ] All outputs stored
- [ ] Winners tracked
- [ ] Published versions archived

**Content Calendar**
- [ ] Schedule view
- [ ] Due dates
- [ ] Assignees

### 3.4 Approvals Workflow

**Status Pipeline**
- [ ] Drafting → In Review → Approved → Scheduled → Published
- [ ] Status transitions
- [ ] Notifications

**Review Features**
- [ ] Inline comments
- [ ] Suggestion mode
- [ ] Approval/rejection with reasons
- [ ] @mentions

### 3.5 Version History

**Tracking**
- [ ] Full edit history
- [ ] Diff view
- [ ] Restore previous version
- [ ] Change attribution

---

## Phase 4: Full Platform

**Timeline**: Q4 2026+  
**Goal**: Complete content creation and publishing platform

### 4.1 Platform Expansion

**X (Twitter)**
- [ ] Thread splitting
- [ ] Character limit warnings
- [ ] Punch detection
- [ ] Thread numbering

**Blog & Newsletter**
- [ ] Full structure generation
- [ ] Title options
- [ ] Heading hierarchy
- [ ] Intro/outro generation
- [ ] SEO optimization

**Multi-Platform**
- [ ] "Create 3 platform versions" from one winner
- [ ] Platform-specific preview

### 4.2 Publishing & Integrations

**Scheduling**
- [ ] Calendar integration
- [ ] Best time suggestions
- [ ] Queue management

**Direct Publishing**
- [ ] LinkedIn API
- [ ] X API
- [ ] Email service integrations

**Export Integrations**
- [ ] Notion
- [ ] Google Docs
- [ ] CMS exports (WordPress, Ghost, etc.)
- [ ] Webhook support

### 4.3 Analytics

**Content Library**
- [ ] Search all generated content
- [ ] Tag-based organization
- [ ] Favorites/bookmarks

**Performance Analytics**
- [ ] What tones win
- [ ] What angles perform
- [ ] Model performance correlation
- [ ] Cost per quality piece

**Personal Insights**
- [ ] Your winning patterns
- [ ] Time-to-decision trends
- [ ] Preferred variants over time

### 4.4 Adaptive Cost Control

**Smart Generation**
- [ ] "Adaptive runs" — start smaller, expand if needed
- [ ] Cheap-first challenger strategy
- [ ] Per-run budget controls
- [ ] Model pool policies

**Cost Optimization**
- [ ] Draft quality prediction before full generation
- [ ] Early termination for low-quality directions
- [ ] Caching of similar prompts

---

## Technical Debt

### Current Items

| Item | Priority | Status | Notes |
|------|----------|--------|-------|
| Admin mock data | High | ⏸️ | Replace with real API |
| Error boundaries | High | ⏸️ | Add React error boundaries |
| Unit tests | Medium | 🔄 | Jest setup complete, adding tests |
| E2E tests | Medium | ⏸️ | Playwright or Cypress |
| Type safety | Medium | ⏸️ | Stricter TypeScript |
| Documentation | Medium | ✅ | PRD, AGENTS, ROADMAP updated |

### Performance Targets

| Metric | MVP Target | Full Product Target |
|--------|-----------|---------------------|
| Gallery load | < 2s for 4 drafts | < 3s for 32 drafts |
| Generation time | < 15s parallel | < 20s parallel |
| Converge action | < 500ms | < 500ms |
| Time-to-decision | < 3 min | < 5 min for 32 drafts |

### Cost Targets

| Tier | Drafts | Est. Cost/Run | Daily Cap |
|------|--------|---------------|-----------|
| Free | 4 | $0.05 | $1 |
| Pro | 16 | $0.50 | $10 |
| Agency | 32 | $1.50 | $50 |

---

## Appendix

### API Reference

See [README.md](./README.md) for endpoint documentation.

### Design System

See [DESIGN.md](./DESIGN.md) for UI/UX specifications.

### Product Requirements

See [PRD.md](./PRD.md) for detailed product requirements.

---

*Last Updated: March 2026*  
*Roadmap Version: 2.0 - Editor-First Arena*

---

## March 2026 Implementation Update

### Completed in this update

- Arena MVP v2 API contracts implemented (`/comparison`, `/comparison/vote`, `/comparison/converge`, `/format`)
- Transitional JSON-backed run persistence added to `comparisons`
- Atomic rate/budget gate RPC path added (`check_and_increment_limits`)
- Stats caching path implemented in API route (30s in-memory TTL)
- Editor/Arena reducer-based UI state flow implemented
- Evaluator-lite and formatter services implemented
- New unit + integration tests added for generation/evaluation/vote/converge/format

### Remaining follow-up

- Replace temporary admin mock pages with real data wiring
- Add deeper component interaction tests (full user flows)
- Roll out background refresh scheduling for cached stats source if traffic increases
