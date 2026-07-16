# بولتن (Booltan)

Persian RTL newsletter and link-curation platform. Nuxt 4 + Nitro, Prisma 7, PostgreSQL.

## Prerequisites

- Node.js 20+
- Docker (for local Postgres) — or your own Postgres instance

## Setup

```bash
# 1. Start a local database
docker-compose up -d

# 2. Configure environment
cp .env.example .env
# Fill in AUTH_SECRET at minimum. SMTP is only needed for anything that
# sends email (register, forgot-password, newsletter send) — see the
# comments in .env.example for a quick way to get one for local dev.

# 3. Install dependencies
npm install

# 4. Apply the database schema
npm run db:migrate

# 5. (Optional) Seed categories, demo links, and two ready-to-use test
#    accounts — set ADMIN_EMAIL/ADMIN_PASSWORD and/or
#    TEST_USER_EMAIL/TEST_USER_PASSWORD in .env first
npm run db:seed

# 6. Run it
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run preview` | Preview a production build locally |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:seed` | Seed categories/demo data/test accounts |
| `npm run db:studio` | Prisma Studio — browse/edit the database in a GUI |

To wipe the database and start clean: `npx prisma migrate reset` (drops, recreates, reapplies all migrations, and re-seeds automatically).

## Notes

- New accounts must verify their email before they can log in (see `/verify-email`). For local testing without SMTP configured, use the seeded test accounts instead — they're created pre-verified.
- Admin panel lives at `/admin`, gated to accounts with the `ADMIN` role.
