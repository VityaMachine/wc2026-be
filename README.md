# WC 2026 Backend (Initial)

Initial backend scaffold for the World Cup 2026 prediction app.

Prerequisites
- Node.js (>=16)
- PostgreSQL

Setup

1. Install dependencies

```bash
npm install
```

2. Copy `.env.example` to `.env` and update `DATABASE_URL`.

3. Generate Prisma client (after setting DATABASE_URL):

```bash
npm run prisma:generate
```

4. Create database schema (first migration):

```bash
npm run prisma:migrate
```

Development

```bash
npm run dev
```

Build & Start

```bash
npm run build
npm run start
```
