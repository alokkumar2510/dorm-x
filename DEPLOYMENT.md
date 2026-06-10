# DORM-X Production Deployment Guide

This guide details the step-by-step procedure to deploy the **DORM-X** platform to production using **Supabase** (Database), **Railway** (Backend), and **Cloudflare Pages** (Frontend).

---

## 1. Database Provisioning (Supabase)

Supabase provides a hosted PostgreSQL database equipped with an enterprise-grade connection pooler (PgBouncer), which is required for serverless or containerized environments using Prisma.

### Step 1: Create a Supabase Project
1. Log in to [Supabase Console](https://supabase.com).
2. Click **New Project** and select your organization.
3. Choose a project name (e.g., `DORM-X`), set a secure database password, and pick a region closest to your server location (e.g., AWS US-East or AWS AP-South).
4. Click **Create New Project** and wait for provisioning to complete.

### Step 2: Retrieve Connection Strings
1. Go to **Project Settings** ➔ **Database**.
2. Locate the **Connection Strings** section and copy the parameters:
   - **Transaction Connection Pooler URL (Port 6543)**: Use this for the backend service (`DATABASE_URL`). Add `?pgbouncer=true&connection_limit=1` to the end.
     ```
     postgresql://postgres.[YOUR_PROJECT_ID]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
     ```
   - **Direct Connection URL (Port 5432)**: Use this for migrations (`DIRECT_URL`).
     ```
     postgresql://postgres.[YOUR_PROJECT_ID]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
     ```

### Step 3: Run Database Migrations
Deploy the Prisma schema directly to your Supabase instance from the `server/` directory:
```bash
# In e:/dorm-x/server
npx prisma migrate deploy
```

---

## 2. Express Backend Containerization & Deployment (Railway)

We containerize and run the Express backend on Railway using the custom multi-stage Dockerfile.

### Step 1: Link Codebase to Railway
1. Go to [Railway Console](https://railway.app) and click **New Project**.
2. Select **Deploy from GitHub repo** and choose your `dorm-x` repository.
3. Select the `server` folder as the root directory for this service (or choose `Deploy from Dockerfile` inside the server subfolder).

### Step 2: Configure Environment Variables
Navigate to **Variables** on the backend service in Railway and set:
- `PORT` = `5000`
- `NODE_ENV` = `production`
- `DATABASE_URL` = `[Supabase Transaction Connection Pooler URL]`
- `DIRECT_URL` = `[Supabase Direct Connection URL]`
- `CLIENT_URL` = `[Your Cloudflare Pages Frontend URL]` (e.g. `https://dorm-x.pages.dev`)
- `JWT_ACCESS_SECRET` = `[A highly secure random string]`
- `JWT_REFRESH_SECRET` = `[Another highly secure random string]`

### Step 3: Launch
Railway will automatically detect [server/Dockerfile](file:///e:/dorm-x/server/Dockerfile), compile the TypeScript code, generate the Prisma client, and start the HTTP server. Once up, copy the generated **Reference URL** (e.g. `https://dorm-x-backend.up.railway.app`).

---

## 3. Frontend Deployment (Cloudflare Pages)

We deploy the Next.js frontend to Cloudflare Pages to leverage global CDN speeds, edge caching, and browser security.

### Step 1: Install @cloudflare/next-on-pages (Optional)
If deploying via standard Git integration, Cloudflare handles the Next.js runtime automatically. For Edge execution, we use the next-on-pages build command:
1. Link your repository in [Cloudflare Dashboard](https://dash.cloudflare.com) under **Workers & Pages** ➔ **Pages** ➔ **Connect to Git**.
2. Select the `dorm-x` repository.

### Step 2: Build Configurations
Set the following build parameters:
- **Framework Preset**: `Next.js (App Router)`
- **Build Command**: `npx @cloudflare/next-on-pages` (or `npm run build` if compiling static exports)
- **Build Output Directory**: `.next` (or `out` if configured as static export)
- **Root Directory**: `/`

### Step 3: Configure Environment Variables
Under the Pages project **Settings** ➔ **Environment Variables**, set:
- `NEXT_PUBLIC_API_URL` = `[Your Railway Backend Reference URL]`

### Step 4: Add Compatibility Flags
Under **Settings** ➔ **Functions** ➔ **Compatibility Flags**:
- Set both production and preview compatibility flags to: `nodejs_compat` (this allows backend/crypto compatibility on the edge).

Click **Save and Deploy**. Cloudflare will compile and provision the SaaS landing page globally.

---

## 4. Security Verification Checklist

Ensure the following are enforced before launching:
1. **Strict CORS**: Confirm that the backend `CLIENT_URL` variable exactly matches the Cloudflare Pages domain (not wildcard `*`).
2. **Encrypted SSL**: Confirm all traffic is routed through HTTPS.
3. **Database Security Rules**: Supabase automatically locks down tables. Ensure Prisma is the only actor with administrative access tokens.
