# semmanuel.com — Blog

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Deploy to Netlify](https://img.shields.io/badge/Deploys%20on-Netlify-00C7B7?logo=netlify)](https://www.netlify.com)

A self-hosted blog platform built with Next.js 15 and Prisma Postgres. Anyone can submit a post — no account needed. An admin reviews submissions and approves or rejects them. Contributors are notified by email when their post is published or needs changes.

Live at [semmanuel.com](https://semmanuel.com)

---

## Features

- **Open submissions** — readers submit posts without creating an account
- **Admin moderation** — approve or reject posts via a protected dashboard
- **Email notifications** — contributors notified on publish/rejection via Brevo
- **Pagination & filtering** — browse posts by status with paginated results
- **Server Actions & API routes** — full CRUD powered by Next.js App Router
- **Auto-deploy** — Netlify deploys on push; migrations run at build time

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) |
| Language | TypeScript + React 19 |
| Database | PostgreSQL via Prisma Postgres (Accelerate) |
| ORM | Prisma ORM v6 |
| Styling | Tailwind CSS |
| Email | Brevo (transactional API) |
| Deployment | Netlify + `@netlify/plugin-nextjs` |

---

## Project Structure

```
semmanuel.com-blog/
├── app/
│   ├── posts/          # Post listing, creation, and detail views
│   ├── admin/          # Admin dashboard (approve / reject)
│   ├── users/          # User management
│   ├── api/            # REST API routes (posts CRUD, logging)
│   └── setup/          # First-run database setup page
├── lib/                # Prisma client, logging utilities
├── prisma/
│   ├── schema.prisma   # Data model
│   ├── migrations/     # Migration history
│   └── seed.ts         # Sample data seed script
└── netlify.toml        # Netlify build + plugin config
```

---

## Environment Variables

Create a `.env` file at the project root with the following:

```bash
# Required — Prisma Postgres connection string
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"

# Required — protects the /admin dashboard
ADMIN_KEY="your-secret-admin-key"

# Optional — email notifications via Brevo (disabled if omitted)
BREVO_API_KEY="your-brevo-api-key"
BREVO_SENDER_EMAIL="you@example.com"

# Optional — used for absolute URLs in emails (defaults to https://blog.semmanuel.com)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

---

## Getting Started

See [USAGE.md](./USAGE.md) for full setup instructions including database provisioning, migrations, seeding, and Netlify deployment.

**Quick start (local):**

```bash
npm install
cp .env.example .env   # fill in your DATABASE_URL and ADMIN_KEY
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Visit `http://localhost:3000` — the admin dashboard is at `/admin?key=YOUR_ADMIN_KEY`.

---

## Deployment

The site deploys automatically to Netlify on every push. The build command runs pending migrations before building Next.js:

```bash
npx prisma migrate deploy && next build
```

Set all environment variables listed above in your Netlify site settings before the first deploy.

---

## Authors

- **Samuel Emmanuel** — design and development

## License

Apache 2.0 — see [LICENSE.md](LICENSE.md) for details.
