# HireNeo AI - Intelligent Recruitment Platform

**Modern, AI-powered Applicant Tracking System (ATS) demonstrating robust backend architecture, scalable integrations, and production-grade reliability.**

[![Node.js](https://img.shields.io/badge/Node.js-v22-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-v15-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16-blue)](https://www.postgresql.org/)

---

## 🚀 Overview

HireNeo AI is a comprehensive B2B SaaS platform designed to streamline the hiring process through automation and artificial intelligence. Built with a "backend-first" mindset, it features a scalable service-oriented architecture, secure API design, and seamless third-party integrations.

### Key Capabilities
- **🤖 AI-Driven Workflows**: Automated resume parsing (PDF/DOCX) and intelligent candidate matching using OpenAI.
- **⚡ Background Processing**: Asynchronous job handling for batch invites and email notifications.
- **🔌 Robust Integrations**: Seamless connections with Resend (Email), OpenAI (AI), and Supabase (Storage/Auth).
- **🛡️ Enterprise Reliability**: Type-safe database interactions with Drizzle ORM and strictly typed API services.

---

## 🏗️ Architecture & Tech Stack

Designed for scalability and maintainability, enabling rapid feature development without tech debt.

### Core Stack
- **Runtime**: Node.js (v24.12.0)
- **Language**: TypeScript (v5.7)
- **Framework**: Next.js 16.1 (App Router / API Routes)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Drizzle ORM (v0.38)
- **State**: React Query (v5.62)
- **AI SDK**: Vercel AI SDK (v4.0)

### User Interface
- **Components**: Shadcn/UI (Radix Primitives)
- **Styling**: TailwindCSS v4
- **Icons**: Lucide React

### Backend Services
- **Validation**: Zod (Runtime schema validation)
- **Email**: Resend API (Transactional emails)
- **AI/ML**: OpenAI GPT-4o (via OpenRouter)
- **Storage**: Supabase Storage (Secure resume hosting)
- **Logging**: Pino (Structured JSON logging)

---

## 📦 Features & Implementation Details

### 1. Service-Oriented Backend (`src/lib/services`)
Business logic is strictly separated from API controllers (`route.ts`).
- **InterviewService**: Handles complex scheduling logic, AI question generation, and assessment token management.
- **ResumeService**: Centralizes file processing, virus scanning (mock), storage uploads, and AI parsing.

### 2. External Integrations
- **Resend**: Implemented with robust error handling and domain verification for reliable delivery.
- **OpenAI**: Utilizes structured outputs (JSON mode) for consistent resume parsing and question generation.
- **Supabase**: Leverages Row Level Security (RLS) and signed URLs for secure data access.

### 3. Background Jobs & Workers
- Asynchronous processing for "AI Batch Invite" feature.
- Decouples heavy AI processing from user-facing API responses for low latency.

### 4. Database Schema (`src/lib/db/schema.ts`)
- **Relational Design**: normalized tables for `jobs`, `candidates`, `interviews`, and `applications`.
- **Data Integrity**: Enforced via foreign keys and enum types (`IN_PROGRESS`, `EVALUATED`, etc.).

---

## 🛠️ Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js >= 22
- PostgreSQL database
- OpenAI & Resend API keys

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/hireneo-ai.git
    cd hireneo-ai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file based on `.env.example`:
    ```env
    DATABASE_URL=postgresql://...
    NEXT_PUBLIC_SUPABASE_URL=...
    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
    OPENAI_API_KEY=sk-...
    RESEND_API_KEY=re_...
    ```

4.  **Database Migration**
    Push the schema to your database:
    ```bash
    npm run db:push
    ```

5.  **Run Development Server**
    Start the API and frontend:
    ```bash
    npm run dev
    ```

6.  **Start Background Worker**
    In a separate terminal:
    ```bash
    npm run worker
    ```

---

## 🧪 Testing

The project includes a test suite using **Vitest** to ensure core logic stability.

```bash
npm run test
```

---

> Built to demonstrate Senior Backend Engineering capabilities: APIs, Integrations, Data Modeling, and Reliability.
