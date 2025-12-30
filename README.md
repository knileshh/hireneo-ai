# HireNeo AI

An AI-powered applicant tracking system demonstrating production backend patterns for distributed job processing, external integrations, and type-safe domain modeling.

![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

**Live:** [hireneo-ai.xyz](https://hireneo-ai.xyz)

---

## Architecture

The system separates synchronous request handling from async processing to maintain fast API responses while handling heavyweight operations (AI inference, email delivery, resume parsing).

```
┌─────────────────────────────────────────────────────────────────┐
│  Client Layer                                                   │
│  └─ Next.js App Router (SSR + Server Actions)                   │
└────────────────────────────┬─────────────────────────────────── ┘
                             │
┌────────────────────────────▼───────────────────────────────────┐
│  API Layer (Route Handlers)                                    │
│  ├─ /api/jobs              │  CRUD + filtering                 │
│  ├─ /api/candidates        │  Resume upload & parsing          │
│  ├─ /api/interviews        │  State machine transitions        │
│  └─ /api/assessment/:token │  Public endpoint (token auth)     │
└────────────────────────────┬───────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────┐
│  Service Layer (Business Logic)                                │
│  ├─ InterviewService       │  Question generation, evaluation  │
│  ├─ ResumeService          │  AI parsing & metadata extraction │
│  └─ State Machine          │  Interview lifecycle enforcement  │
└────────────────────────────┬───────────────────────────────────┘
                             │
       ┌─────────────────────┴──────────────────────┐
       │                                            │
┌──────▼──────────┐                    ┌───────────▼───────────┐
│  Postgres       │                    │  Redis + BullMQ       │
│  (Drizzle ORM)  │                    │  ├─ Email Queue       │
│                 │                    │  ├─ Evaluation Queue  │
│  7 tables       │                    │  └─ Reminder Queue    │
│  FK constraints │                    │                       │
│  JSONB fields   │                    │  Separate Worker      │
└─────────────────┘                    │  Process (4 workers)  │
                                       └───────────────────────┘
```

### Why This Split?

**Problem:** Batch operations (sending 500 interview invites) would block the API for 30+ seconds.

**Solution:** Queue jobs to Redis, return immediately. Background workers pick up jobs and process async.

**Result:** API responses stay <200ms. Failed jobs retry with exponential backoff. System can scale workers independently.

---

## Technical Highlights

### 1. Interview State Machine

Implemented as a finite state automaton to prevent invalid transitions:

```typescript
// src/lib/domain/interview-state-machine.ts

type State = 'pending' | 'in_progress' | 'completed' | 'evaluated';
type Event = 'start' | 'submit' | 'evaluate';

const transitions: Record<State, Partial<Record<Event, State>>> = {
  pending:     { start: 'in_progress' },
  in_progress: { submit: 'completed' },
  completed:   { evaluate: 'evaluated' },
  evaluated:   {},
};

// Prevents: Moving from 'evaluated' back to 'pending' (illegal)
// Enforces: All state changes go through validated transitions
// Audit: Logs every transition with timestamp for debugging
```

**Why:** State bugs in interview workflows cause real business problems (lost data, duplicate emails). FSM makes illegal states unrepresentable.

### 2. Resilient External Integrations

Wrapped third-party SDKs with custom adapters to handle:
- Exponential backoff retries (3 attempts, 5-10s delays)
- Rate limit detection and backoff
- Timeout handling (30s max)
- Error normalization to internal error types

```typescript
// src/lib/integrations/openai/client.ts

async parseResume(file: Buffer): Promise<ParsedResume> {
  return retry(
    async () => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        response_format: { type: 'json_object' }, // Structured output
        messages: [{ role: 'user', content: prompt }],
        timeout: 30000,
      });
      return ParsedResumeSchema.parse(JSON.parse(response.content));
    },
    { attempts: 3, backoff: 'exponential' }
  );
}
```

**Integrations:**
- OpenAI (resume parsing, question generation, answer evaluation)
- Resend (transactional emails with custom domain)
- Supabase (auth + file storage with signed URLs)
- Polar.sh (payment processing + webhook verification)

### 3. Background Job Pattern

BullMQ workers run in a separate process (`scripts/worker.ts`) with:

```typescript
// Idempotency: Same input = same job ID (no duplicates)
const jobId = createHash('sha256')
  .update(JSON.stringify(data))
  .digest('hex');

await emailQueue.add('interview-invite', data, {
  jobId,
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
});
```

**Why separate process?**
- Workers can crash + restart independently without affecting API
- Scale workers separately (10 workers, 1 API server)
- Graceful shutdown: Workers finish active jobs before exiting (no data loss on deploy)

### 4. Type-Safe Database Layer

Using Drizzle ORM for:
- Full TypeScript inference from schema to queries
- Compile-time relationship checking
- Enum constraints at DB level

```typescript
// Drizzle infers types from schema definition
const candidatesWithInterviews = await db.query.candidates.findMany({
  with: {
    interviews: {
      with: { job: true },
      where: eq(interviews.status, 'completed'),
    },
  },
});

// Type: Candidate & { interviews: (Interview & { job: Job })[] }
```

**Schema highlights:**
- Foreign key constraints with cascade deletes
- JSONB for flexible metadata (resume parsing results)
- Enum types for state machines (interview_status)
- Timestamps (created_at, updated_at) on all tables

---

## Infrastructure

**Deployment:** Google Cloud Run (serverless containers)  
**Networking:** Direct VPC Egress to private Redis VM (`us-central1`)  
**CI/CD:** Cloud Build with Docker layer caching (~5min builds)

```
App + Worker (Cloud Run, Singapore)
         │
         ├─ VPC Tunnel ─┐
         │              │
         ▼              ▼
    Postgres       Redis VM (e2-micro, Iowa - Free Tier)
  (Supabase)       Private IP: 10.128.0.2
```

**Why this setup?**
- Cloud Run scales to zero (cost-efficient for low traffic)
- Redis VM stays up 24/7 (queue persistence)
- VPC tunnel = private network (Redis not exposed to internet)
- Singapore region for low latency to India/Asia

---

## Setup

```bash
# Install
npm install

# Environment (see .env.example)
cp .env.example .env

# Database
npm run db:push

# Run (2 terminals)
npm run dev     # Terminal 1: API server (port 3000)
npm run worker  # Terminal 2: Background jobs
```

**Required env vars:**
```bash
DATABASE_URL="postgresql://..."
UPSTASH_REDIS_URL="redis://..."
OPENAI_API_KEY="sk-..."
RESEND_API_KEY="re_..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
```

---

## Project Structure

```
src/
├── app/
│   ├── api/               # REST endpoints
│   ├── dashboard/         # Protected UI
│   └── assessment/[token] # Public assessment page
│
├── lib/
│   ├── domain/
│   │   ├── services/      # Business logic layer
│   │   └── interview-state-machine.ts
│   │
│   ├── integrations/      # External API wrappers
│   │   ├── openai/
│   │   ├── resend/
│   │   ├── polar/
│   │   └── supabase/
│   │
│   ├── queue/
│   │   ├── factory.ts     # Queue definitions
│   │   └── workers/       # 4 worker files
│   │
│   └── db/
│       ├── schema.ts      # Drizzle schema
│       └── migrations/
│
scripts/
└── worker.ts              # Worker process entrypoint
```

---

**Tech:** Node 24 · TypeScript 5.7 · Next.js 16.1 · React 19 · Postgres · Drizzle 0.38 · BullMQ 5.34 · Vercel AI SDK

Built by [Nilesh Kumar](https://knileshh.com)
