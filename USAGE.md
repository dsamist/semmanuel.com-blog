# Usage Guide

Step-by-step instructions to set up, run, and deploy the blog locally and on Netlify.

---

## Prerequisites

- Node.js 18+
- A [Prisma Data Platform](https://console.prisma.io) account (free tier available)
- A [Brevo](https://www.brevo.com) account for email notifications *(optional)*
- A [Netlify](https://app.netlify.com) account for deployment *(optional)*

---

## 1. Clone and install

```bash
git clone https://github.com/your-username/semmanuel.com-blog.git
cd semmanuel.com-blog
npm install
```

---

## 2. Provision a Prisma Postgres database

1. Go to [console.prisma.io](https://console.prisma.io) and click **New project**.
2. Give your project a name, then click **Get started** under **Prisma Postgres**.
3. Choose a region close to you and click **Create project**.
4. From the **Set up database access** section, copy the `DATABASE_URL`. It looks like:

```
prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY
```

---

## 3. Configure environment variables

Create a `.env` file at the project root:

```bash
cp .env.example .env   # if an example exists, otherwise create it manually
```

Fill in the values:

```bash
# Prisma Postgres connection string (from step 2)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"

# Protects the /admin dashboard — choose any strong secret string
ADMIN_KEY="your-secret-admin-key"

# Brevo email notifications (optional — skip if you don't need emails)
BREVO_API_KEY="your-brevo-api-key"
BREVO_SENDER_EMAIL="you@example.com"

# Base URL used in notification emails (defaults to https://blog.semmanuel.com)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

> **Note:** Never commit your `.env` file. It is already listed in `.gitignore`.

---

## 4. Run database migrations

Apply the Prisma schema to your database:

```bash
npx prisma migrate dev --name init
```

<details>
<summary>Using yarn, pnpm, or bun</summary>

```bash
yarn prisma migrate dev --name init
pnpm prisma migrate dev --name init
bun prisma migrate dev --name init
```

</details>

---

## 5. Seed the database (optional)

Populate the database with sample users and blog posts:

```bash
npx prisma db seed
```

<details>
<summary>Using yarn, pnpm, or bun</summary>

```bash
yarn prisma db seed
pnpm prisma db seed
bun prisma db seed
```

</details>

---

## 6. Start the development server

```bash
npm run dev
```

<details>
<summary>Using yarn, pnpm, or bun</summary>

```bash
yarn dev
pnpm run dev
bun run dev
```

</details>

Open [http://localhost:3000](http://localhost:3000) to view the blog.

---

## 7. Access the admin dashboard

The admin dashboard is protected by your `ADMIN_KEY`. Navigate to:

```
http://localhost:3000/admin?key=YOUR_ADMIN_KEY
```

From the dashboard you can:
- **Approve** submitted posts (triggers a notification email to the contributor)
- **Reject** posts with feedback (contributor is also notified)
- View all pending submissions

---

## 8. Set up email notifications (Brevo)

Email notifications are sent when posts are approved or rejected.

1. Create a free account at [brevo.com](https://www.brevo.com).
2. Go to **SMTP & API → API Keys** and generate a key.
3. Add a verified sender email under **Senders & IP**.
4. Set `BREVO_API_KEY` and `BREVO_SENDER_EMAIL` in your `.env`.

If these variables are not set, email sending is silently skipped — the rest of the app works normally.

---

## 9. Deploy to Netlify

### Option A — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init          # link to an existing or new site
netlify env:set DATABASE_URL "your-database-url"
netlify env:set ADMIN_KEY "your-admin-key"
netlify env:set BREVO_API_KEY "your-brevo-key"
netlify env:set BREVO_SENDER_EMAIL "you@example.com"
netlify env:set NEXT_PUBLIC_SITE_URL "https://yourdomain.com"
git push              # triggers auto-deploy
```

### Option B — Netlify dashboard

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
2. Connect your GitHub repo and select this repository.
3. The build settings are pre-configured in `netlify.toml` — no changes needed.
4. Under **Site settings → Environment variables**, add all variables from step 3.
5. Click **Deploy site**.

Netlify runs `npx prisma migrate deploy` automatically before each build, so your database schema stays in sync on every deploy.

### Option C — Prisma Postgres Netlify extension

For a tighter integration with automatic database provisioning, install the [Prisma Postgres extension](https://www.netlify.com/integrations/prisma) from the Netlify integrations marketplace.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Cannot find module '@prisma/client'` | Run `npm install` then `npx prisma generate` |
| Database connection error | Verify `DATABASE_URL` is correct and the Prisma Postgres instance is active |
| Admin dashboard returns 403 | Check that `ADMIN_KEY` in your `.env` matches the `?key=` query param |
| Emails not sending | Confirm `BREVO_API_KEY` is valid and `BREVO_SENDER_EMAIL` is a verified sender |
| Build fails on Netlify | Ensure all required env vars are set in Netlify site settings |
