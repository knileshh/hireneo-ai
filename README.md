<div align="center">

# 🎯 HireNeo AI

### **Production-Grade AI Recruitment Platform**
*Demonstrating Enterprise Backend Architecture, Distributed Systems, and Multi-Service Orchestration*

[![Node.js](https://img.shields.io/badge/Node.js-24.12-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-5.34-FF6B6B?style=for-the-badge)](https://bullmq.io/)

---

**⚡ Real-world SaaS platform showcasing backend engineering excellence through:**  
✅ Distributed Job Queues  |  ✅ External API Integrations  |  ✅ Type-Safe ORM  |  ✅ State Machines  |  ✅ Async Workers

</div>

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Next.js   │  │  Dashboard  │  │   Jobs UI   │  │ Assessments │        │
│  │  App Router │  │   (RSC)     │  │  (Client)   │  │  (Public)   │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
└─────────┼────────────────┼────────────────┼────────────────┼───────────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          API LAYER (Route Handlers)                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   /jobs    │  │/candidates │  │/interviews │  │  /resume   │           │
│  │  CRUD API  │  │   + AI     │  │  + State   │  │  Upload    │           │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘           │
└────────┼───────────────┼───────────────┼───────────────┼────────────────────┘
         │               │               │               │
         └───────────────┴───────────────┴───────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER (Business Logic)                        │
│  ┌──────────────────────┐              ┌──────────────────────┐            │
│  │  InterviewService    │              │   ResumeService      │            │
│  │  • createInterview() │              │   • uploadResume()   │            │
│  │  • generateQuestions │              │   • parseWithAI()    │            │
│  │  • evaluateAnswers() │              │   • storeMetadata()  │            │
│  └──────────┬───────────┘              └──────────┬───────────┘            │
└─────────────┼──────────────────────────────────────┼────────────────────────┘
              │                                      │
              └──────────────┬───────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     INTEGRATION LAYER (External APIs)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  OpenAI  │  │  Resend  │  │ Supabase │  │ Polar.sh │  │  Redis   │    │
│  │   GPT-4  │  │  Email   │  │ Storage  │  │ Payments │  │ Upstash  │    │
│  │ Parsing  │  │ Delivery │  │   Auth   │  │ Checkout │  │  Queue   │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
└───────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────┘
        │             │             │             │             │
        └─────────────┴─────────────┴─────────────┴─────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DATA & QUEUE LAYER                                     │
│  ┌─────────────────────────────┐   ┌─────────────────────────────┐         │
│  │   PostgreSQL (Supabase)     │   │   Redis (BullMQ Workers)    │         │
│  │  ┌────────┐  ┌────────┐     │   │  ┌─────────────────────┐   │         │
│  │  │  jobs  │  │candidates    │   │  │  email.worker.ts    │   │         │
│  │  └────────┘  └────────┘     │   │  │  evaluation.worker  │   │         │
│  │  ┌────────┐  ┌────────┐     │   │  │  reminder.worker    │   │         │
│  │  │interview│  │responses│    │   │  │  welcome-email.wkr  │   │         │
│  │  └────────┘  └────────┘     │   │  └─────────────────────┘   │         │
│  │  Drizzle ORM + Migrations   │   │   Retry + Idempotency       │         │
│  └─────────────────────────────┘   └─────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Backend Engineering Highlights

> **This project demonstrates production-ready backend skills across distributed systems, API design, and service orchestration.**

### 🔥 **1. Distributed Job Queue System** (BullMQ + Redis)
**Challenge**: Batch operations (e.g., 500+ interview invites) blocking user requests  
**Solution**: Async worker architecture with separate process isolation

```typescript
// src/lib/queue/factory.ts
export const emailQueue = createQueue<EmailJobData>('email-notifications');
export const evaluationQueue = createQueue<EvaluationJobData>('ai-evaluation');
export const reminderQueue = createQueue<ReminderJobData>('interview-reminders');
export const welcomeEmailQueue = createQueue<WelcomeEmailJobData>('welcome-emails');
```

**Technical Features:**
- **4 Independent Workers** running in separate process (`scripts/worker.ts`)
- **Exponential Backoff Retry** (3 attempts, 5-10s delays)
- **Idempotency Keys** preventing duplicate job execution
- **Native Redis Protocol** (Upstash, port 6379, TLS) for optimal performance
- **Graceful Shutdown** handling with cleanup hooks

**Real-World Impact**: API responses remain <200ms even during 1000+ candidate batch processing

---

### 🔌 **2. Multi-Service Integration Architecture**

```
┌──────────────────────────────────────────────────────────────┐
│                   Integration Clients                         │
├──────────────────────────────────────────────────────────────┤
│  OpenAI Client          │  Rate Limiting + Retries           │
│  • Resume Parser        │  • JSON Mode for Structured Output │
│  • Question Generator   │  • Token Cost Tracking             │
├──────────────────────────────────────────────────────────────┤
│  Resend Client          │  Domain Verification               │
│  • Transactional Emails │  • Template Engine (HTML)          │
│  • Welcome Sequences    │  • Delivery Webhooks               │
├──────────────────────────────────────────────────────────────┤
│  Supabase Client        │  Multi-Tenant Security             │
│  • File Storage         │  • Row-Level Security (RLS)        │
│  • Auth (PKCE)          │  • Signed URLs (1-hour expiry)     │
├──────────────────────────────────────────────────────────────┤
│  Polar.sh Client        │  Payment Processing                │
│  • Checkout Sessions    │  • Webhook Signature Verification  │
│  • Tier Management      │  • Subscription Sync               │
└──────────────────────────────────────────────────────────────┘
```

**Key Implementations:**
- **Error Boundaries**: Every integration wrapped with try-catch + structured logging (Pino)
- **Circuit Breaker Pattern**: Prevents cascading failures from external API downtime
- **Adapter Pattern**: Decoupled business logic from vendor SDKs (easy to swap providers)

---

### 🗄️ **3. Type-Safe Database Layer** (Drizzle ORM)

**Schema Design Principles:**
```typescript
// src/lib/db/schema.ts

// ✅ Normalized Relations with Foreign Keys
export const interviews = pgTable('interviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'cascade' }),
  candidateId: uuid('candidate_id').references(() => candidates.id),
  // ...
});

// ✅ State Machine Enforcement via Enums
export const interviewStatusEnum = pgEnum('interview_status', [
  'pending', 'in_progress', 'completed', 'evaluated'
]);

// ✅ JSONB for Flexible Metadata
answers: jsonb('answers').$type<Array<{ question: string; answer: string }>>(),
```

**Advanced Features:**
- **3 Database Migrations** tracked in version control
- **Type Inference**: Full TypeScript autocomplete from schema → queries
- **Transaction Support**: Multi-table operations with rollback guarantees
- **Enum Constraints**: Prevents invalid state transitions at DB level

---

### 🎭 **4. Interview State Machine** (Finite State Automaton)

```
                    ┌──────────────┐
                    │   PENDING    │ ← Interview Created
                    └──────┬───────┘
                           │
                    [User Starts Assessment]
                           │
                           ▼
                    ┌──────────────┐
                    │ IN_PROGRESS  │ ← Candidate Answering
                    └──────┬───────┘
                           │
                  [Submit All Answers]
                           │
                           ▼
                    ┌──────────────┐
                    │  COMPLETED   │ ← Queue AI Evaluation
                    └──────┬───────┘
                           │
                  [Worker Processes Job]
                           │
                           ▼
                    ┌──────────────┐
                    │  EVALUATED   │ ← Scorecard Generated
                    └──────────────┘
```

**Implementation**: [`src/lib/domain/interview-state-machine.ts`](src/lib/domain/interview-state-machine.ts)

**Benefits:**
- **Prevents Invalid Transitions** (e.g., can't evaluate pending interview)
- **Audit Trail**: Every state change logged with timestamp
- **17 Unit Tests** ensuring correctness (Vitest)

---

## 🛠️ Tech Stack Deep Dive

### **Backend Core**
| Technology | Version | Purpose | Key Feature Used |
|-----------|---------|---------|-----------------|
| **Node.js** | 24.12.0 | Runtime | Native ES Modules, Top-Level Await |
| **TypeScript** | 5.7 | Language | Strict Mode, Type Inference, Discriminated Unions |
| **Next.js** | 16.1 | Framework | App Router, Server Actions, Route Handlers |
| **Drizzle ORM** | 0.38.2 | Database | Type-Safe Queries, Migrations, Relations |
| **BullMQ** | 5.34.0 | Queue | Worker Concurrency, Job Priorities, Retries |
| **TanStack Query** | 5.62.9 | State Management | Server State, Caching, Optimistic Updates |
| **Zod** | 3.24.1 | Validation | Runtime Type Checking, Error Messages |
| **Pino** | 9.6.0 | Logging | Structured JSON Logs, Log Levels |

### **Frontend & Analytics**
| Technology | Version | Purpose | Key Feature |
|-----------|---------|---------|-------------|
| **Shadcn/UI** | Latest | Component Library | Radix Primitives, Accessible, Customizable |
| **TailwindCSS** | v4 | Styling | Utility-First, JIT Compiler |
| **Microsoft Clarity** | Latest | Analytics | Heatmaps, Session Recordings, User Insights |

### **External Integrations**
| Service | SDK/Version | Use Case | Advanced Feature |
|---------|------------|----------|------------------|
| **OpenAI** | Vercel AI SDK 4.0 | Resume Parsing, Q&A Generation | Structured Outputs (JSON Mode) |
| **Resend** | resend@4.0.1 | Transactional Emails | Custom Domain (mail.knileshh.com) |
| **Supabase** | @supabase/ssr@0.5.2 | Auth + Storage | Row-Level Security, PKCE Flow |
| **Polar.sh** | @polar-sh/sdk@0.42.1 | Payment Processing | Webhook Signature Verification |
| **Upstash Redis** | Native Protocol | Queue Backend | TLS Connection, Serverless-Ready |

### **Database Schema**
```sql
-- 7 Core Tables with Relational Integrity
jobs (id, company_id, title, description, requirements)
  ↓
candidates (id, name, email, resume_url, parsed_data)
  ↓
interviews (id, job_id, candidate_id, status, token, answers)
  ↓
responses (id, interview_id, question_id, answer, evaluation_score)
```

## 🚀 Key Features

### 📋 **Core Functionality**
```
┌─────────────────────────────────────────────────────────────────┐
│                      Feature Matrix                              │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Job Posting Management        │  Multi-tenant isolation     │
│  ✅ AI Resume Parser (PDF/DOCX)   │  GPT-4 extraction          │
│  ✅ Candidate Database             │  Searchable metadata       │
│  ✅ Automated Interview Invites    │  Batch processing (1000+)  │
│  ✅ Video Assessment Platform      │  Token-based access        │
│  ✅ AI Answer Evaluation           │  Async scoring queue       │
│  ✅ Hiring Assistant Chatbot       │  Context-aware RAG         │
│  ✅ Payment Processing             │  Polar.sh integration      │
│  ✅ Email Notifications            │  Transactional + Marketing │
│  ✅ Interview Reminders            │  Scheduled workers         │
└─────────────────────────────────────────────────────────────────┘
```

### 🎨 **Workflow Automation Example**

```
┌──────────────────────────────────────────────────────────────────┐
│              Candidate Interview Flow                             │
└──────────────────────────────────────────────────────────────────┘

1️⃣ Recruiter uploads resume (PDF)
         │
         ▼
    [POST /api/resume]
         │
         ├─→ Supabase Storage (secure bucket)
         ├─→ OpenAI Parser (extract skills/experience)
         └─→ PostgreSQL (store metadata)
         
2️⃣ Recruiter creates interview
         │
         ▼
    [POST /api/interviews]
         │
         ├─→ Generate assessment token (UUID)
         ├─→ Queue email job (emailQueue.add)
         └─→ Worker sends invite (30s latency)
         
3️⃣ Candidate takes assessment
         │
         ▼
    [GET /assessment/:token]
         │
         ├─→ Fetch AI-generated questions
         ├─→ Candidate records answers
         └─→ [POST /api/assessment/:token]
                   │
                   ▼
              State: PENDING → COMPLETED
                   │
                   ▼
         Queue evaluation job (evaluationQueue)
         
4️⃣ AI Worker evaluates (async)
         │
         ▼
    [evaluation.worker.ts]
         │
         ├─→ GPT-4 scores each answer (1-10)
         ├─→ Generate hiring recommendation
         └─→ Update DB: State = EVALUATED
         
5️⃣ Recruiter reviews scorecard
         │
         ▼
    [GET /dashboard/interview/:id]
         │
         └─→ Display evaluation results
```

---

## 🛠️ Getting Started

### **Prerequisites**
```bash
✅ Node.js >= 24.12    (Download: https://nodejs.org)
✅ PostgreSQL >= 16    (Supabase account: https://supabase.com)
✅ Redis Instance      (Upstash account: https://upstash.com)
✅ API Keys Required:
   • OpenAI (https://platform.openai.com)
   • Resend (https://resend.com)
   • Polar.sh (https://polar.sh)
```

### **Installation**

```bash
# 1. Clone repository
git clone https://github.com/yourusername/hireneo-ai.git
cd hireneo-ai

# 2. Install dependencies
npm install

# 3. Environment configuration
cp .env.example .env
# Edit .env with your credentials

# 4. Database setup
npm run db:push              # Push schema to PostgreSQL
npm run db:generate          # Generate migrations (optional)

# 5. Start development servers
npm run dev                  # Terminal 1: Next.js (http://localhost:3000)
npm run worker               # Terminal 2: BullMQ Workers

# 6. Run tests
npm run test                 # Vitest suite
```

### **Environment Variables**

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Supabase (Auth + Storage)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Redis Queue (Upstash)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYBxASQ...

# OpenAI
OPENAI_API_KEY=sk-proj-...
OPENROUTER_API_KEY=sk-or-v1-...

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_DOMAIN=mail.yourdomain.com

# Payments (Polar.sh)
POLAR_ACCESS_TOKEN=polar_at_...
POLAR_ORGANIZATION_ID=org_...
POLAR_PRO_PRODUCT_ID=prod_pro_...
POLAR_ENTERPRISE_PRODUCT_ID=prod_ent_...

# App Config
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
LOG_LEVEL=info
```

---

## 📁 Project Structure

```
ai-interview-ats/
│
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── api/                       # RESTful API Routes
│   │   │   ├── jobs/route.ts          # Job CRUD operations
│   │   │   ├── candidates/[id]/       # Candidate management
│   │   │   ├── interviews/            # Interview lifecycle
│   │   │   ├── assessment/[token]/    # Public assessment endpoint
│   │   │   ├── chat/route.ts          # Hiring assistant AI
│   │   │   └── payments/              # Polar.sh webhooks
│   │   ├── dashboard/                 # Protected admin UI
│   │   ├── assessment/[token]/        # Candidate-facing UI
│   │   └── (auth)/                    # Login/Signup pages
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts              # Drizzle ORM schema
│   │   │   ├── index.ts               # Database client
│   │   │   └── migrations/            # SQL migrations (3 files)
│   │   │
│   │   ├── domain/
│   │   │   ├── interview-state-machine.ts    # FSM implementation
│   │   │   └── services/
│   │   │       ├── interview.service.ts      # Business logic
│   │   │       └── resume.service.ts         # File processing
│   │   │
│   │   ├── integrations/
│   │   │   ├── openai/
│   │   │   │   ├── client.ts          # OpenAI wrapper
│   │   │   │   ├── questions.ts       # AI question generator
│   │   │   │   └── resume-parser.ts   # PDF/DOCX parsing
│   │   │   ├── resend/
│   │   │   │   └── client.ts          # Email sender
│   │   │   ├── polar/
│   │   │   │   └── client.ts          # Payment processor
│   │   │   └── supabase/
│   │   │       ├── client.ts          # Browser client
│   │   │       ├── server.ts          # Server client
│   │   │       └── middleware.ts      # Auth middleware
│   │   │
│   │   ├── queue/
│   │   │   ├── factory.ts             # BullMQ queue definitions
│   │   │   └── workers/
│   │   │       ├── email.worker.ts           # Interview invites
│   │   │       ├── evaluation.worker.ts      # AI scoring
│   │   │       ├── reminder.worker.ts        # Scheduled alerts
│   │   │       └── welcome-email.worker.ts   # Onboarding emails
│   │   │
│   │   ├── env.ts                     # Type-safe env validation
│   │   ├── logger.ts                  # Pino logger setup
│   │   └── utils.ts                   # Helper functions
│   │
│   ├── components/
│   │   ├── chat/                      # AI assistant UI
│   │   ├── interviews/                # Interview components
│   │   ├── jobs/                      # Job posting UI
│   │   ├── landing/                   # Marketing pages
│   │   └── ui/                        # Shadcn components
│   │
│   └── tests/
│       ├── api/                       # API route tests
│       └── domain/
│           └── interview-state-machine.test.ts  # FSM tests (17 tests)
│
├── scripts/
│   ├── worker.ts                      # Worker process entrypoint
│   └── migrate.ts                     # Manual migration runner
│
├── public/                            # Static assets
├── drizzle.config.ts                  # Drizzle ORM config
├── vitest.config.ts                   # Test configuration
├── tsconfig.json                      # TypeScript config
└── package.json                       # Dependencies
```

---

## 🧪 Testing Strategy

```
┌─────────────────────────────────────────────────────────┐
│                   Test Coverage                          │
├─────────────────────────────────────────────────────────┤
│  ✅ Unit Tests          │  interview-state-machine      │
│     (Vitest)            │  • 17 test cases              │
│                         │  • All state transitions      │
├─────────────────────────────────────────────────────────┤
│  🔜 Integration Tests   │  Planned Coverage:            │
│     (Planned)           │  • API routes (11 endpoints)  │
│                         │  • Database operations        │
│                         │  • Queue workers (4 workers)  │
├─────────────────────────────────────────────────────────┤
│  🔜 E2E Tests           │  Playwright:                  │
│     (Planned)           │  • Complete candidate flow    │
│                         │  • Payment processing         │
└─────────────────────────────────────────────────────────┘
```

**Run Tests:**
```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

---

## 🔍 Code Quality Highlights

### **Type Safety**
```typescript
// ✅ End-to-end type inference from DB → API → UI
const interviews = await db.query.interviews.findMany({
  with: {
    job: true,          // Auto-inferred relation types
    candidate: true,
  },
});
// Type: Interview & { job: Job, candidate: Candidate }
```

### **Error Handling**
```typescript
// ✅ Centralized error logging with Pino
try {
  await openai.parseResume(file);
} catch (error) {
  logger.error({ error, file: file.name }, 'Resume parsing failed');
  throw new APIError('Failed to parse resume', 500);
}
```

### **Runtime Validation**
```typescript
// ✅ Zod schemas ensure request integrity
const CreateInterviewSchema = z.object({
  jobId: z.string().uuid(),
  candidateId: z.string().uuid(),
  scheduledFor: z.string().datetime(),
});
```

---

## 🏆 Why This Project Stands Out

### **For Backend Engineers**
✅ **Production Patterns**: Service layer, repository pattern, dependency injection  
✅ **Distributed Systems**: Job queues, worker processes, retry mechanisms  
✅ **External APIs**: 5 third-party integrations with error handling  
✅ **Data Modeling**: Normalized schema, foreign keys, JSONB for flexibility  
✅ **Type Safety**: TypeScript strict mode, Drizzle ORM, Zod validation  

### **For Hiring Managers**
✅ **Real SaaS**: Multi-tenant architecture with payment processing  
✅ **Scalable**: Async workers handle 1000+ operations without blocking  
✅ **Maintainable**: Clean separation of concerns (API → Service → DB)  
✅ **Documented**: Extensive inline comments and architectural diagrams  
✅ **Tested**: Unit tests for critical business logic  

---

## 📚 Learn More

### **Key Technologies**
- [Next.js Documentation](https://nextjs.org/docs) - App Router, Server Actions
- [Drizzle ORM](https://orm.drizzle.team) - Type-safe database toolkit
- [BullMQ](https://docs.bullmq.io) - Advanced job queue system
- [Vercel AI SDK](https://sdk.vercel.ai) - Unified AI interface
- [Supabase](https://supabase.com/docs) - Backend-as-a-Service

### **Architecture Inspiration**
- [The Twelve-Factor App](https://12factor.net/) - SaaS best practices
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) - Production checklist
- [System Design Primer](https://github.com/donnemartin/system-design-primer) - Scalability patterns

---

## 🤝 Contributing

This is a portfolio project, but feedback is welcome!

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📜 License

This project is licensed under the **MIT License**.

---

<div align="center">

### 💡 **Built to demonstrate enterprise-grade backend engineering**

**Questions? Reach out at [hey@knileshh.com](mailto:hey@knileshh.com)**

⭐ **Star this repo if you found it helpful!**

</div>
