# HireNeo AI

An AI-powered interview orchestration system demonstrating backend workflows, integrations, and reliability patterns for B2B SaaS.

## 🎯 What This Proves

> "I can own backend workflows, integrations, background jobs, and reliability in a real SaaS system."

This project showcases:
- **State Machines**: Explicit guarded transitions for interview lifecycle
- **Background Jobs**: BullMQ workers with idempotency and retry logic
- **External Integrations**: Resend (email) and OpenAI (AI evaluations) with error handling
- **Production Patterns**: Structured logging, environment validation, graceful shutdown
- **Modern Stack**: Next.js 15, Drizzle ORM, TypeScript, PostgreSQL

---

## 📦 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | v22.20.0 LTS | Runtime |
| **TypeScript** | v5.9.3 | Type safety |
| **Next.js** | v15.1.6 | Full-stack framework (App Router) |
| **Drizzle ORM** | v0.45.1 | Database access |
| **BullMQ** | v5.66.4 | Background job queues |
| **Redis** | v7 | Queue backing store |
| **PostgreSQL** | v16 | Relational database |
| **Vercel AI SDK** | v4.0.21 | AI function calling |
| **Resend** | v4.0.3 | Transactional emails |
| **Pino** | v9.6.0 | Structured logging |
| **Vitest** | v2.x | Unit/integration testing |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 22.20.0
- **Docker** (for PostgreSQL and Redis)
- **OpenAI API Key**
- **Resend API Key**

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd hireneo-ai
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hireneo_ai
REDIS_HOST=localhost
REDIS_PORT=6379
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
NODE_ENV=development
LOG_LEVEL=info
```

### 3. Start Infrastructure

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL** on port 5432
- **Redis** on port 6379

### 4. Run Database Migrations

```bash
npm run db:push
```

### 5. Start Application

**Terminal 1** - Next.js App:
```bash
npm run dev
```

**Terminal 2** - Background Workers:
```bash
npm run worker
```

The app will be available at `http://localhost:3000`.

---

## 🔌 API Endpoints

### Health Check
```bash
GET /api/health
```

Returns database and Redis connectivity status.

### Create Interview
```bash
POST /api/interviews
Content-Type: application/json

{
  "candidateName": "John Doe",
  "candidateEmail": "john@example.com",
  "interviewerEmail": "interviewer@company.com",
  "scheduledAt": "2025-12-30T10:00:00Z",
  "meetingLink": "https://meet.google.com/abc-defg-hij",
  "notes": "Backend engineer position"
}
```

**Response:** `201 Created`
- Creates interview in `SCHEDULED` status
- Queues confirmation email job

### List Interviews
```bash
GET /api/interviews?page=1&limit=20&status=SCHEDULED&search=John
```

**Query Params:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `status` (optional): `CREATED | SCHEDULED | COMPLETED | EVALUATION_PENDING | EVALUATED`
- `search` (optional): Search by candidate name or email

### Get Single Interview
```bash
GET /api/interviews/:id
```

Returns interview with evaluation (if exists).

### Update Interview
```bash
PATCH /api/interviews/:id
Content-Type: application/json

{
  "status": "COMPLETED",
  "notes": "Candidate demonstrated strong system design skills"
}
```

**State Machine Validation:**
- Enforces valid transitions only
- Returns `400 Bad Request` for invalid transitions

### Trigger AI Evaluation
```bash
POST /api/interviews/:id/evaluate
```

**Requirements:**
- Interview must be in `COMPLETED` status
- Updates status to `EVALUATION_PENDING`
- Queues AI evaluation job
- Worker updates to `EVALUATED` when complete

**Response:** `202 Accepted`

---

## 🔄 Interview State Machine

```
CREATED → SCHEDULED → COMPLETED → EVALUATION_PENDING → EVALUATED
```

**Enforced Rules:**
- Cannot skip states
- `EVALUATED` is terminal (no further transitions)
- Invalid transitions return `400 Bad Request`

**Implementation:** [`src/lib/domain/interview-state-machine.ts`](src/lib/domain/interview-state-machine.ts)

---

## ⚙️ Background Jobs (BullMQ)

### Email Worker
- **Queue:** `email`
- **Concurrency:** 5
- **Retries:** 3 (exponential backoff: 2s, 4s, 8s)
- **Idempotency:** Job ID = `email-${interviewId}`

### Evaluation Worker
- **Queue:** `evaluation`
- **Concurrency:** 2 (rate limiting for AI API)
- **Retries:** 3
- **Idempotency:** 
  - Job ID = `eval-${interviewId}`
  - DB-level check (unique constraint on `evaluations.interview_id`)

**Start Workers:**
```bash
npm run worker
```

**Monitoring:**
```bash
# View logs
pm2 logs worker

# BullBoard dashboard (optional)
npm run queue:ui
```

---

## 🧪 Testing

### Run Unit Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

**Test Files:**
- `src/tests/domain/interview-state-machine.test.ts` - State machine transitions

---

## 📁 Project Structure

```
hireneo-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # Backend API routes
│   │   │   ├── health/
│   │   │   └── interviews/
│   │   └── dashboard/          # Frontend
│   ├── lib/                    # Backend core
│   │   ├── db/                 # Drizzle ORM
│   │   │   ├── schema.ts       # Database schema
│   │   │   └── index.ts        # DB client
│   │   ├── domain/             # Business logic
│   │   │   └── interview-state-machine.ts
│   │   ├── integrations/       # External APIs
│   │   │   ├── openai/
│   │   │   └── resend/
│   │   ├── queue/              # BullMQ
│   │   │   ├── factory.ts
│   │   │   └── workers/
│   │   ├── env.ts              # Zod validation
│   │   └── logger.ts           # Pino logger
│   └── tests/                  # Test suites
├── scripts/
│   └── worker.ts               # Worker entry point
├── docker-compose.yml
└── README.md
```

---

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `REDIS_HOST` | Redis hostname | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `RESEND_API_KEY` | Resend API key | `re_...` |
| `NODE_ENV` | Environment | `development | production | test` |
| `LOG_LEVEL` | Logging level | `debug | info | warn | error` |

---

## 🚨 Error Handling & Production Readiness

### Resend Integration
- **Rate Limiting:** Catches `429` errors, logs, and re-throws for BullMQ retry
- **Auth Errors:** Detects `401/403` and logs configuration issues
- **Retries:** Exponential backoff (3 attempts)

### OpenAI Integration
- **Quota Errors:** Detects `insufficient_quota` and provides actionable message
- **Timeout Handling:** Built into Vercel AI SDK
- **Structured Output:** Zod schema validation ensures consistent evaluation format

### Database
- **Connection Pooling:** `pg.Pool` for efficient connections
- **Unique Constraints:** Prevent duplicate evaluations at DB level

### Logging
- **Structured Logs:** JSON format in production (pretty print in dev)
- **Contextual Info:** Every log includes `interviewId`, `jobId`, etc.

### Graceful Shutdown
- Workers listen for `SIGTERM` and close gracefully
- Prevents job loss during deployments

---

## 🏗️ Architectural Decisions

### Why Next.js Monolith?
- **Faster Shipping:** 2-3 day timeline favors single codebase
- **Shared Types:** Zod schemas used in both API and frontend
- **Production Ready:** Vercel deployment is trivial
- **Framework Agnostic Logic:** All business logic in `src/lib/` can be ported to Express in <1 hour

### Why Separate Worker Process?
- **Isolation:** Crashes don't affect API
- **Scalability:** Can scale workers independently
- **Resource Control:** Different concurrency settings per queue

### Why No Separate Candidates Table?
- **Simplified Scope:** Focus on core workflow (2-3 day constraint)
- **Sufficient for Demo:** Embedding candidate data in `interviews` table proves JSONB, state machines, and async jobs

---

## 🛠️ Development

### Database Management

```bash
# Generate migrations
npm run db:generate

# Push schema to DB
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

### Linting & Type Checking

```bash
npm run lint
npm run type-check (via tsc --noEmit)
```

---

## 📊 Production Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use managed PostgreSQL (e.g., Neon, Supabase)
- [ ] Use managed Redis (e.g., Upstash)
- [ ] Add rate limiting to API routes
- [ ] Set up error tracking (Sentry)
- [ ] Configure CORS for frontend domain
- [ ] Add authentication (NextAuth.js)
- [ ] Set up CI/CD (GitHub Actions)
- [ ] Health check monitoring (UptimeRobot)

---

## 📝 License

MIT

---

## 👨‍💻 Author

Built as a backend assessment showcase by [Your Name].

**Contact:**
- Email: [your@email.com]
- LinkedIn: [linkedin.com/in/yourprofile]
- GitHub: [github.com/yourusername]
