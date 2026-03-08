# BlindLane Product Requirements Document

> Blind taste testing for content. Arena UX. Editor-first UI. Agency-ready.

---

## 1. Product Summary

BlindLane helps creators and teams generate multiple content drafts from multiple LLMs, compare them anonymously, pick a winner, then publish the chosen draft as platform-ready content.

The product feels like an **editor with an Arena mode inside it**. The gallery view makes scanning easy. The compare view makes decisions fast. The converge action turns the winner into the working draft. Model identities stay hidden until the winner is selected.

### Current Status
- **MVP**: 2 LLMs, 2 variants each = 4 drafts (in progress)
- **Full Product**: 8 LLMs, 4 variants each = 32 drafts (planned)

---

## 2. Target Users

### Primary: Content Creators
- Publish frequently (daily/weekly)
- Want "best output now" without model nerding
- Value speed and quality over technical details
- Examples: Solo creators, influencers, thought leaders

### Secondary: Small Agencies
- Managing multiple clients
- Need brand consistency and approvals
- Require reuse and templating
- Examples: Social media agencies, content studios

### Later: Marketing Teams & Enterprise
- Larger teams with workflows
- Compliance and approval processes
- Scale and governance needs

---

## 3. Core Value Proposition

**Quality certainty without bias.**

One prompt becomes multiple anonymous drafts. You choose based on quality, not brand. A separate evaluator AI adds tags, similarity grouping, and predictive signals to reduce time-to-decision. After selection, the winner becomes an editable draft formatted for your platform.

### Key Differentiators

| Feature | BlindLane | Simple Comparison Tools |
|---------|-----------|------------------------|
| UI Pattern | Editor-first with Arena mode | Standalone comparison |
| Draft Volume | 4-32 drafts per run | 2 drafts |
| Evaluation | AI-powered tagging & scoring | Manual review only |
| Output | Platform-ready formatted content | Raw text only |
| Workflow | Converge → Edit → Publish | Compare only |

---

## 4. Product Experience & UI

### 4.1 Single Workspace Layout

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER: Logo | Workspace | Credits | Profile               │
├──────────┬─────────────────────────┬─────────────────────────┤
│          │                         │                         │
│  LEFT    │       CENTER            │        RIGHT            │
│  RAIL    │       EDITOR            │        ARENA            │
│          │                         │                         │
│  • Work- │  ┌─────────────────┐   │  ┌─────────────────┐   │
│    space  │  │ Prompt Input    │   │  │ GALLERY VIEW    │   │
│  • Client │  │                 │   │  │                 │   │
│  • Brand  │  │ [Generate ▼]    │   │  │ ┌───┐ ┌───┐    │   │
│    Kit    │  └─────────────────┘   │  │ │ A │ │ B │    │   │
│  • Camp-  │                         │  │ └───┘ └───┘    │   │
│    aign   │  ┌─────────────────┐   │  │ ┌───┐ ┌───┐    │   │
│  • History│  │ Working Draft   │   │  │ │ C │ │ D │    │   │
│          │  │ (after converge)│   │  │ └───┘ └───┘    │   │
│          │  └─────────────────┘   │  └─────────────────┘   │
│          │                         │                         │
└──────────┴─────────────────────────┴─────────────────────────┘
```

**Three zones:**
1. **Left Rail**: Navigation (Workspace, Client, Brand Kit, Campaign, History)
2. **Center**: Editor and prompt controls - where users live
3. **Right**: Arena gallery and evaluation - where users choose

Arena is a **mode in the editor**, not a separate product.

### 4.2 Arena Modes

#### Gallery View
- Grid of anonymous draft cards (2x2 for MVP, 4x8 for full)
- Short previews (first 150 chars)
- Evaluator chips (tags, scores)
- Click to expand full text
- Progressive loading for large grids

#### Compare View
- 2-up side-by-side (MVP)
- 3-up option (full product)
- Linked scrolling
- Keyboard voting (1, 2, 3)
- Better / Tie / Skip actions

#### Converge
- User selects winner
- Other drafts collapse to discarded drawer
- Winner opens in editor as working draft
- **Reveal panel appears**: model identity, variant, cost, latency

---

## 5. Draft Generation Model

### 5.1 MVP Target
- **2 LLMs** (GPT-4o Mini, Claude 3.5 Haiku)
- **2 variants per LLM**
- **4 drafts total**, anonymous (A, B, C, D)

### 5.2 Full Product Target
- **8 LLMs**
- **4 variants per LLM**
- **32 drafts total** (Draft A to Draft AF)

### 5.3 Variant System

Variants are intentional angles, consistent across models:

| Variant | Angle | Description |
|---------|-------|-------------|
| 1 | Concise | Direct, punchy, no fluff |
| 2 | Story-driven | Narrative, emotional hook |
| 3 | Contrarian | Counter-intuitive, spicy |
| 4 | Empathetic | Warm, human, supportive |

Variants are **controlled templates**, not random temperature noise.

---

## 6. Evaluator AI (Auto-Judge)

A separate evaluator model scores and tags drafts. It does **not** pick the winner—it helps the user pick faster.

### 6.1 Per Draft Outputs

| Output | Description |
|--------|-------------|
| Tags | Tone, angle, audience, industry fit |
| Platform Fit Score | How well it suits target platform |
| Clarity Score | Readability and structure |
| Human Feel Score | Naturalness, avoids AI tells |
| Engagement Prediction | Estimated performance (heuristic) |
| Risk Flags | Claims, compliance, unsafe phrasing |
| Similarity Cluster ID | Groups near-duplicates |

### 6.2 Global Outputs Per Run

| Output | Description |
|--------|-------------|
| Shortlist | Top 5-8 drafts with one-line reasons |
| Diversity View | Recommended set of distinct angles |
| "What's Missing" | Suggestions for next run |

**Important**: Evaluator must not reveal model identities.

---

## 7. Publishing & Export

After converge, the editor becomes the product.

### 7.1 Platform Formats

User selects destination format:
- LinkedIn post
- X post or thread
- Email
- Blog
- Newsletter

### 7.2 Platform-Native Formatting

| Platform | Formatting Applied |
|----------|-------------------|
| LinkedIn | Hook, spacing, CTA, optional hashtags |
| X | Thread splitting, punch, character limits |
| Email | Subject options, preview text, body |
| Blog | Title options, headings, intro, outro |

### 7.3 Export Options
- Copy to clipboard
- Markdown
- Later: Scheduled posting, integrations

---

## 8. Agency Mode (Full Product)

Multi-client workflow capabilities:

| Feature | Description |
|---------|-------------|
| Workspaces | Separate environments per team/client |
| Brand Kits | Voice notes, banned phrases, claims rules, examples |
| Campaigns | Prompt sets, outputs, winners, published versions |
| Approvals | Drafting → In Review → Approved → Scheduled → Published |
| Comments | Inline feedback and discussion |
| Version History | Track changes and iterations |
| Role Permissions | Owner, Editor, Reviewer |

---

## 9. Non-Functional Requirements

### Quality
- Detect near-duplicates and cluster them
- Enforce consistent variant templates across LLMs
- Stable formatting for platform exports

### Performance
- Parallel generation across models
- Timeouts and graceful degradation
- Gallery loads progressively

### Cost
- Per-run spend cap
- Daily user cap
- Tier-based model pools
- Retries only for transient failures

### Privacy
- Clear retention settings
- Enterprise: zero-retention option

---

## MVP vs Full Product

### MVP Scope

**Models**: 2 LLMs × 2 variants = 4 drafts

**UI**:
- Single screen (editor center, gallery right)
- 2×2 draft grid
- 2-up compare view
- Converge to winner

**Evaluator (Lite)**:
- Tags: tone, angle
- Scores: clarity, human feel, platform fit
- Basic duplicate detection
- Shortlist: "Top pick", "Runner-up"

**Publish**: LinkedIn, Email

**Billing**: Basic auth, subscription or credits

### Full Product Scope

**Models**: 8 LLMs × 4 variants = 32 drafts

**UI**:
- 32-card gallery with filters
- 2-up and 3-up compare
- Keyboard shortcuts
- Diversity view toggle

**Evaluator (Full)**:
- Rich taxonomy
- Engagement prediction with explanation
- Risk detection
- SEO scoring
- Embedding-based clustering

**Publish**: All platforms + thread editor

**Agency**: Workspaces, campaigns, approvals, analytics

**Integrations**: Scheduling, CMS, API

---

## Success Metrics

### MVP
- % of runs where user converges within 3 minutes
- Publish/export rate
- Repeat usage within 7 days
- Average cost per run within target
- User-reported time savings

### Full Product
- Time-to-decision improvement as draft count scales
- Agency client satisfaction
- Content performance correlation with evaluator scores
- Cost per quality content piece

---

## Out of Scope (Explicit)

**MVP**:
- Live auto-posting
- Enterprise compliance claims
- Complex multi-step tool use
- Fine-tuning workflows

**Full Product** (Future):
- Image generation
- Video content
- Real-time collaboration

---

## Deliverables

### MVP
- [ ] Editor-first single screen
- [ ] 4 anonymous drafts
- [ ] Compare and converge
- [ ] Evaluator-lite tags and scores
- [ ] LinkedIn and email formatting
- [ ] Reveal after selection
- [ ] Basic auth and billing

### Full Product
- [ ] 32-draft gallery with clustering
- [ ] 3-up compare and keyboard UX
- [ ] Full evaluator intelligence
- [ ] Multi-platform drafting
- [ ] Agency workflows
- [ ] Adaptive cost control

---

*Last Updated: March 2026*
*PRD Version: 1.0*
