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

Next.js App Router, TypeScript, Neon Postgres, Prisma, NextAuth credentials, Tailwind CSS, React Hook Form/Zod-ready server validation, bcryptjs, Lucide React, and Recharts.

## Architecture

The application uses the Next.js App Router. Pages are server components by default and read through the Prisma client in `src/lib/db.ts`. User-facing form mutations remain Next.js server actions in `src/app/actions.ts`; HTTP consumers use route handlers under `src/app/api`.

Prisma is the only database access layer. `src/lib/db.ts` creates one shared Prisma client during local hot reload, and Prisma communicates with Neon using `DATABASE_URL`. No database credentials are exposed to browser code.

```text
Browser or API client
        |
Next.js pages, server actions, and route handlers
        |
src/lib/db.ts (Prisma Client)
        |
Neon Postgres
```

Key locations:

- `src/app` - pages, server actions, and API route handlers.
- `src/app/api` - HTTP API. Every Prisma route declares the Node.js runtime.
- `src/lib/db.ts` - shared Prisma client configured from `DATABASE_URL`.
- `src/lib/api.ts` - JSON error responses and Prisma/Zod error mapping.
- `src/lib/auth.ts` - NextAuth configuration and role checks.
- `prisma/schema.prisma` - source of truth for the Postgres schema.
- `prisma/migrations` - committed, deployable schema migrations.
- `prisma/seed.ts` - optional demonstration data.

## Setup

Prerequisites: Node.js 20.19+ and a Neon account/project.

1. In Neon, create a project and database. From its **Connect** panel, copy both connection strings.
2. Copy `.env.example` to `.env` and set all values.
3. Set `DATABASE_URL` to Neon's pooled connection URL, normally the host containing `-pooler`.
4. Set `DIRECT_URL` to Neon's direct connection URL, without `-pooler`. Prisma uses this URL for migrations.
5. Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`; set `NEXTAUTH_URL` to `http://localhost:3000`.
6. Install packages: `npm install`.
7. Apply the committed migrations: `npm run db:deploy`.
8. Optionally add demonstration data: `npm run db:seed`.
9. Start development: `npm run dev`.

To make a schema change locally, edit `prisma/schema.prisma`, create a named migration with `npm run db:migrate -- --name descriptive_change`, then commit the generated migration. Never use `prisma db push` for a deployed database. For production use `npm run db:deploy`, `npm run build`, and `npm start` after configuring environment variables.

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Neon pooled URL used by the application at runtime. Keep `sslmode=require`. |
| `DIRECT_URL` | Yes for migrations | Neon direct URL used by Prisma migration commands. |
| `NEXTAUTH_URL` | Yes | Canonical application URL, such as `http://localhost:3000`. |
| `NEXTAUTH_SECRET` | Yes | Long, random secret used to sign NextAuth JWT sessions. |

`.env` and `.env.local` are local secrets and must not be committed. `.env.example` contains only placeholders.

## Database API

All routes return JSON. Successful collection responses use `{ "data": ... }`; errors use `{ "error": { "message": "..." } }`. The public routes intentionally omit contact information, user accounts, answer keys, and other private data.

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Runs a lightweight Neon query and returns database connection status. |
| `GET` | `/api/challenges` | Public | Lists non-cancelled challenges. |
| `GET` | `/api/families` | Public | Lists active families and active member counts. |
| `POST` | `/api/families` | Administrator | Creates a family and records an audit event. |
| `GET` | `/api/leaderboard` | Public | Returns the latest active/completed challenge leaderboard. |
| `GET` | `/api/leaderboard?challenge=<challengeId>` | Public | Returns the leaderboard for one challenge. |

Example health check:

```bash
curl http://localhost:3000/api/health
```

Example administrator family creation, using a browser session cookie from an authenticated administrator:

```bash
curl -X POST http://localhost:3000/api/families \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=YOUR_SESSION_TOKEN' \
  --data '{"name":"Bethany Family","phone":"+2348000000000","email":"bethany@example.com","location":"Main Campus"}'
```

API write routes validate request bodies with Zod, verify the active NextAuth user and role, and use Prisma transactions for related records. When adding a route, import `db` from `@/lib/db`, declare `export const runtime = "nodejs"`, select only fields safe for the endpoint, validate all input, and route failures through `handleApiError`.

## Vercel Deployment

1. Push this repository to GitHub and import it in Vercel.
2. Provision a Neon Postgres database.
3. In **Vercel → Project Settings → Environment Variables**, set these variables for Production, Preview, and Development:
    - `DATABASE_URL` - Neon's pooled PostgreSQL connection URL. It must include `sslmode=require`.
    - `DIRECT_URL` - Neon's direct PostgreSQL connection URL, also with `sslmode=require`; deployment migrations use this URL.
   - `NEXTAUTH_SECRET` - generate with `openssl rand -base64 32`.
   - `NEXTAUTH_URL` - your production URL, for example `https://your-project.vercel.app`.
4. Set the Vercel build command to `npm run vercel-build` (or let Vercel detect the script automatically). This applies pending migrations, generates the Prisma Client for Vercel's Linux runtime, and builds Next.js.
5. Deploy. Seed data is optional and should be run once from a trusted terminal against the production database: `DATABASE_URL="..." npm run db:seed`.

Do not use the local example database URL in Vercel. A missing or inaccessible `DATABASE_URL` causes Prisma runtime failures; a missing or inaccessible `DIRECT_URL` causes migration failures.

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

- `src/app` - App Router pages, API route handlers, and server actions
- `src/components` - layout, dashboard, leaderboard, auth, and quiz components
- `src/lib` - Prisma database client, API utilities, authentication, authorization, and scoring services
- `prisma/schema.prisma` - PostgreSQL schema
- `prisma/seed.ts` - demonstration data

## Notes

The live leaderboard uses ISR polling rather than a websocket service. Use the database API for integrations and clients that need JSON; use server actions for existing form workflows inside this application.
