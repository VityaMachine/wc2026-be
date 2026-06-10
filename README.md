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

2. Copy `.env.example` to `.env` and update required environment variables.

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string.
- `DIRECT_URL`: direct PostgreSQL connection string used by Prisma migrations when configured separately from a pooled URL.
- `JWT_SECRET`: secret used to sign JWT access tokens. The app will not start without it.
- `CORS_ORIGIN`: allowed frontend origin, for example `http://localhost:3001`.
- `APP_URL`: public backend URL used by Swagger/OpenAPI and email links if needed.
- `BREVO_API_KEY`: Brevo Transactional Email API key used to send verification and password reset emails.
- `BREVO_SENDER_NAME`: sender display name. Defaults to `WC2026 Predictor`.
- `BREVO_SENDER_EMAIL`: verified Brevo sender email address. If omitted, the app falls back to `SMTP_FROM`/`SMTP_USER` for backward compatibility.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: legacy SMTP variables. They can stay during migration, but email delivery uses Brevo when `BREVO_API_KEY` is set.

3. Generate Prisma client (after setting DATABASE_URL):

```bash
npm run prisma:generate
```

4. Create database schema in development:

```bash
npm run prisma:migrate
```

For production, run committed migrations with:

```bash
npm run db:migrate:prod
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

## Email verification setup with Brevo

Email verification and password reset emails are sent through the Brevo Transactional Email REST API.

1. Create a Brevo API key for Transactional Email.
2. Verify the sender email in Brevo.
3. Put the Brevo values into `.env` or Railway variables.
4. Keep the real `.env` file out of git and never commit real API keys.

Example email settings:

```env
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_NAME="WC2026 Predictor"
BREVO_SENDER_EMAIL=your_verified_sender@example.com
APP_FRONTEND_URL=http://localhost:3001
```

Production email variables for Railway:

```env
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_NAME="WC2026 Predictor"
BREVO_SENDER_EMAIL=your_verified_sender@example.com
APP_FRONTEND_URL=https://your-frontend-domain.example
```

`APP_FRONTEND_URL` is used only for the link inside the email:

```text
http://localhost:3001/verify-email?token=...
```

The backend verification endpoint remains:

```text
/api/v1/auth/verify-email?token=...
```
