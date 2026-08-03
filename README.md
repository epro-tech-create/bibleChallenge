# DITSCF VerseQuest

**Read. Compete. Grow.** VerseQuest is a full-stack, family-based Scripture competition platform for DITSCF Fellowship. Families register members, nominate challengers, compete through timed Bible quizzes, and follow live scores in the Hall of Champions.

## Features

- Credentials authentication with bcrypt password hashes and role protection.
- Administrator, Family Leader, and Challenger workflows.
- PostgreSQL/Prisma data model for families, quests, rounds, questions, sessions, answers, scores, announcements, and audits.
- Daniel chapters 1–12 demonstration challenge with 3 rounds and 21 questions.
- Server-validated timed answer submission, duplicate-answer protection, automatic objective marking, manual marking, and score adjustments.
- Responsive public landing page, family directory, schedule, news, dashboards, live leaderboard, control center, and quiz waiting room.

## Stack

Next.js App Router, TypeScript, PostgreSQL, Prisma, NextAuth credentials, Tailwind CSS, React Hook Form/Zod-ready server validation, bcryptjs, Lucide React, and Recharts.

## Setup

Prerequisites: Node.js 20+ and PostgreSQL 15+.

1. Create a PostgreSQL database named `versequest`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` and a strong `NEXTAUTH_SECRET`.
3. Install packages: `npm install`.
4. Generate Prisma client: `npm run db:generate`.
5. Create and apply the migration: `npm run db:migrate -- --name init`.
6. Add demo data: `npm run db:seed`.
7. Start development: `npm run dev`.

For production use `npm run db:deploy`, `npm run build`, and `npm start` after configuring environment variables.

## Vercel Deployment

1. Push this repository to GitHub and import it in Vercel.
2. Provision a hosted PostgreSQL database (Vercel Postgres, Neon, Supabase, or Railway).
3. In **Vercel → Project Settings → Environment Variables**, set these variables for Production, Preview, and Development:
   - `DATABASE_URL` - the provider's pooled PostgreSQL connection URL. It must include `sslmode=require` when required by the provider.
   - `NEXTAUTH_SECRET` - generate with `openssl rand -base64 32`.
   - `NEXTAUTH_URL` - your production URL, for example `https://your-project.vercel.app`.
4. Set the Vercel build command to `npm run vercel-build` (or let Vercel detect the script automatically). This applies pending migrations, generates the Prisma Client for Vercel's Linux runtime, and builds Next.js.
5. Deploy. Seed data is optional and should be run once from a trusted terminal against the production database: `DATABASE_URL="..." npm run db:seed`.

Do not use the local example database URL in Vercel. A missing or inaccessible `DATABASE_URL` causes Prisma migration and runtime failures.

## Demo Accounts

All demo accounts use password `VerseQuest2026!`.

| Role          | Email                         |
| ------------- | ----------------------------- |
| Administrator | `admin@versequest.test`       |
| Family Leader | `leader1@versequest.test`     |
| Challenger    | `challenger1@versequest.test` |

## Main Workflow

1. An administrator creates fellowship families, a challenge, rounds, and question bank entries.
2. Family leaders add members and submit up to the challenge's per-family challenger limit.
3. The administrator opens a quiz session and selects each active question in the Live Challenge Control Center.
4. Challengers submit one answer before the server timer expires.
5. Objective answers receive marks automatically; written/oral answers go to manual marking.
6. Family scores recalculate and the public Hall of Champions refreshes every five seconds.

## Project Structure

- `src/app` - App Router pages, route handler, and server actions
- `src/components` - layout, dashboard, leaderboard, auth, and quiz components
- `src/lib` - database, authentication, authorization, and scoring services
- `prisma/schema.prisma` - PostgreSQL schema
- `prisma/seed.ts` - demonstration data

## Notes

The first migration is intentionally generated locally from the schema because migration SQL must match the PostgreSQL version and environment used by the fellowship. Run the setup migration command above before seeding. The initial live leaderboard uses ISR polling rather than a websocket service.
