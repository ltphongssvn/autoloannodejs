# AutoLoan Node.js API

REST API for auto loan application management, migrated from Rails to Node.js/Express.

## Tech Stack

- **Runtime**: Node.js 20+ (ESM)
- **Framework**: Express.js
- **Database**: PostgreSQL 16 + Sequelize ORM
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Testing**: Jest (180+ tests, 92%+ coverage)
- **Security**: Helmet-style headers, rate limiting, detect-secrets, CORS

## Quick Start

```bash
# Install dependencies
npm install

# Start with Docker
docker-compose up -d

# Or manually (requires PostgreSQL)
cp env.example.txt .env
npm run db:migrate
npm run db:seed
npm run dev
```

## API Endpoints

### Auth

- `POST /api/v1/auth/signup` — Register
- `POST /api/v1/auth/login` — Login
- `DELETE /api/v1/auth/logout` — Logout (auth required)

### Applications

- `GET /api/v1/applications` — List (paginated)
- `GET /api/v1/applications/:id` — Show
- `POST /api/v1/applications` — Create draft
- `POST /api/v1/applications/:id/submit` — Submit
- `DELETE /api/v1/applications/:id` — Delete draft

### Documents

- `GET /api/v1/applications/:id/documents` — List
- `POST /api/v1/applications/:id/documents` — Upload
- `PATCH /api/v1/documents/:id/verify` — Verify (staff)
- `PATCH /api/v1/documents/:id/reject` — Reject (staff)

### Loan Officer

- `POST /api/v1/loan-officer/applications/:id/review` — Start review
- `POST /api/v1/loan-officer/applications/:id/request-documents` — Request docs
- `POST /api/v1/loan-officer/applications/:id/notes` — Add note

### Underwriter

- `POST /api/v1/underwriter/applications/:id/approve` — Approve
- `POST /api/v1/underwriter/applications/:id/reject` — Reject

### Users

- `GET /api/v1/users/profile` — Current user profile
- `PATCH /api/v1/users/profile` — Update profile
- `GET /api/v1/users` — List users (staff)

### Health

- `GET /api/v1/health` — Health check

## Scripts

| Command              | Description                   |
| -------------------- | ----------------------------- |
| `npm run dev`        | Start dev server (watch mode) |
| `npm start`          | Start production server       |
| `npm test`           | Run tests with coverage       |
| `npm run db:migrate` | Run migrations                |
| `npm run db:seed`    | Seed database                 |
| `npm run db:reset`   | Reset database                |

## Testing

```bash
npm test                    # All tests with coverage
npm run test:coverage       # Explicit coverage run
```

Coverage thresholds enforced via pre-push hooks:

- Statements/Lines/Functions: 80%+
- Branches: 70%+
- Per-directory thresholds (middleware: 90%, models: 85%)

## Project Structure

```
src/
├── config/          # App & database configuration
├── controllers/     # Route handlers
│   ├── auth/        # Registration, sessions
│   ├── loanOfficer/ # Review workflows
│   └── underwriter/ # Approval/rejection
├── middleware/       # Auth, authorization, security, errors, rate limiting
├── migrations/      # Sequelize migrations (11 tables)
├── models/          # Sequelize models (11 models)
├── routes/          # Express route definitions
├── seeders/         # Seed data
├── serializers/     # JSONAPI serializers
├── services/        # Business logic
├── utils/           # Logger, custom errors
├── server.js        # Express app entry point
└── __tests__/       # Jest test suites
```

## Security

- JWT auth with denylist for logout
- bcrypt password hashing (10 rounds)
- Rate limiting (Rack::Attack equivalent)
- Security headers (CSP, HSTS, X-Frame-Options)
- detect-secrets pre-commit hook
- Security audit logging

## Roles

| Role             | Permissions                                             |
| ---------------- | ------------------------------------------------------- |
| Customer (0)     | Create/submit own applications, upload documents        |
| Loan Officer (1) | Review applications, verify/reject documents, add notes |
| Underwriter (2)  | Approve/reject applications                             |
