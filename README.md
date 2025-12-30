# HireNeo AI

> AI-powered applicant tracking system demonstrating production backend patterns for distributed job processing, external integrations, and type-safe domain modeling.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-hireneo--ai.xyz-1A3305?style=for-the-badge)](https://hireneo-ai.xyz)

![Next.js](https://img.shields.io/badge/Next.js-16-000?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=flat-square&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)
![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=flat-square&logo=google-cloud&logoColor=white)

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TanStack Query, Shadcn/ui, Tailwind CSS 4, Framer Motion |
| **Backend** | Next.js 16 App Router, Drizzle ORM, BullMQ, Zod |
| **AI** | OpenAI GPT-4, Vercel AI SDK |
| **Database** | PostgreSQL (Supabase), Redis |
| **Auth & Storage** | Supabase Auth, Supabase Storage (signed URLs) |
| **Email** | Resend (transactional emails) |
| **Payments** | Polar.sh (subscriptions + webhooks) |
| **Infrastructure** | Google Cloud Run, Docker, Cloud Build |
| **DevOps** | Husky (git hooks), Pino (structured logging), TypeScript strict mode |
| **Analytics** | Microsoft Clarity |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Client Layer                                                   │
│  └─ Next.js App Router (SSR + Server Actions)                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  API Layer (Route Handlers)                                     │
│  ├─ /api/jobs              │  CRUD + filtering                  │
│  ├─ /api/candidates        │  Resume upload & parsing           │
│  ├─ /api/interviews        │  State machine transitions         │
│  └─ /api/assessment/:token │  Public endpoint (token auth)      │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  Service Layer (Business Logic)                                 │
│  ├─ InterviewService       │  Question generation, evaluation   │
│  ├─ ResumeService          │  AI parsing & metadata extraction  │
│  └─ State Machine          │  Interview lifecycle enforcement   │
└────────────────────────────┬────────────────────────────────────┘
                             │
       ┌─────────────────────┴──────────────────────┐
       │                                            │
┌──────▼──────────┐                    ┌───────────▼───────────┐
│  PostgreSQL     │                    │  Redis + BullMQ       │
│  (Drizzle ORM)  │                    │  ├─ Email Queue       │
│                 │                    │  ├─ Evaluation Queue  │
│  • 7 tables     │                    │  └─ Reminder Queue    │
│  • FK cascades  │                    │                       │
│  • JSONB fields │                    │  Separate Worker      │
└─────────────────┘                    │  Process (4 workers)  │
                                       └───────────────────────┘
```

### Design Decisions

| Problem | Solution | Result |
|---------|----------|--------|
| Batch ops block API (30s+) | Queue to Redis, return immediately | API responses <200ms |
| Failed jobs lose data | Exponential backoff retries | 3 retry attempts with persistence |
| Workers affect API stability | Separate process (`worker.ts`) | Independent scaling & crashes |

---

## Key Features

### 1. Interview State Machine

Prevents invalid transitions with a finite state automaton:

```typescript
// src/lib/domain/interview-state-machine.ts

type State = 'pending' | 'in_progress' | 'completed' | 'evaluated';

const transitions: Record<State, Partial<Record<Event, State>>> = {
  pending:     { start: 'in_progress' },
  in_progress: { submit: 'completed' },
  completed:   { evaluate: 'evaluated' },
  evaluated:   {}, // Terminal state
};
```

**Why:** State bugs cause real problems (duplicate emails, lost data). FSM makes illegal states unrepresentable.

### 2. Resilient External Integrations

All third-party SDKs wrapped with:
- ✅ Exponential backoff (3 attempts, 5-10s delays)
- ✅ Rate limit detection
- ✅ 30s timeout handling
- ✅ Error normalization

```typescript
// Structured error handling with Zod validation
const result = await retry(
  () => openai.chat.completions.create({...}),
  { attempts: 3, backoff: 'exponential' }
);
return ParsedResumeSchema.parse(JSON.parse(result.content));
```

### 3. Background Job Processing

```typescript
// Idempotent job creation (no duplicates)
await emailQueue.add('interview-invite', data, {
  jobId: hash(data),        // Same input = same ID
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
});
```

### 4. Type-Safe Database Layer

Full TypeScript inference from schema to queries:

```typescript
const result = await db.query.candidates.findMany({
  with: {
    interviews: { where: eq(interviews.status, 'completed') },
  },
});
// Type: Candidate & { interviews: Interview[] }
```

---

## Infrastructure

```
┌──────────────────────────────────────────────┐
│  Cloud Run (Singapore)                       │
│  ├─ App Container (Next.js)                  │
│  └─ Worker Container (BullMQ)                │
└───────────────┬──────────────────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
    ▼                       ▼
PostgreSQL              Redis VM
(Supabase)              (VPC Private IP)
```

**Why this setup:**
- Cloud Run scales to zero (cost-efficient)
- Redis VM stays up 24/7 (queue persistence)
- VPC tunnel = Redis not exposed to internet
- Singapore region for low latency to Asia

---

## Quick Start

```bash
# Clone & install
git clone https://github.com/knileshh/hireneo-ai.git
cd hireneo-ai && npm install

# Environment
cp .env.example .env  # Fill in values

# Database
npm run db:push

# Run (2 terminals)
npm run dev     # API server (port 3000)
npm run worker  # Background jobs
```

### Required Environment Variables

```bash
DATABASE_URL="postgresql://..."
UPSTASH_REDIS_URL="redis://..."
OPENAI_API_KEY="sk-..."
RESEND_API_KEY="re_..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

---

## Project Structure

```
src/
├── app/
│   ├── api/                 # REST endpoints
│   ├── dashboard/           # Protected UI
│   └── assessment/[token]   # Public assessment page
│
├── lib/
│   ├── services/            # Business logic (InterviewService, ResumeService)
│   ├── domain/              # State machine
│   ├── integrations/        # OpenAI, Resend, Polar, Supabase wrappers
│   ├── queue/               # BullMQ queues + 4 workers
│   └── db/                  # Drizzle schema + migrations
│
└── scripts/
    └── worker.ts            # Worker process entrypoint
```

---

## License

MIT © [Nilesh Kumar](https://knileshh.com) • [hey@knileshh.com](mailto:hey@knileshh.com)
