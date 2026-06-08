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
- `JWT_SECRET`: secret used to sign JWT access tokens. The app will not start without it.
- `CORS_ORIGIN`: allowed frontend origin, for example `http://localhost:3001`.
- `APP_URL`: public backend URL used by Swagger/OpenAPI and email links if needed.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: required for sending verification and password reset emails.

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

## Email verification setup with Gmail SMTP

Email verification uses SMTP through Nodemailer. For Gmail, do not use your regular Gmail password.

1. Enable 2-Step Verification in your Google Account.
2. Create a Google App Password for this backend app.
3. Put that App Password into `SMTP_PASS` in your local `.env`.
4. Keep the real `.env` file out of git and never commit real SMTP credentials.

Example local email settings:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM="WC2026 Predictor <your_gmail@gmail.com>"
APP_FRONTEND_URL=http://localhost:3001
```

`APP_FRONTEND_URL` is used only for the link inside the email:

```text
http://localhost:3001/verify-email?token=...
```

The backend verification endpoint remains:

```text
/api/v1/auth/verify-email?token=...
```
