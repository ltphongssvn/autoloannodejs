# AutoLoan Frontend

Next.js 15 + TypeScript + Tailwind CSS frontend for the AutoLoan application.

## Setup
```bash
cd frontend
cp env.local.example .env.local
npm install
npm run dev
```

Frontend runs on `http://localhost:3001`, proxies API requests to `http://localhost:3000`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm test` | Run tests |
| `npm run test:coverage` | Tests with coverage |
| `npm run test:watch` | Watch mode |
| `npm run lint` | ESLint check |

## Architecture
```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Landing page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── dashboard/        # Customer dashboard
│   ├── applications/
│   │   ├── new/          # Multi-step application form
│   │   └── [id]/         # Application detail view
│   ├── forgot-password/  # Password reset request
│   ├── reset-password/   # Password reset form
│   ├── confirm-email/    # Email confirmation
│   └── account-locked/   # Account locked notice
├── components/
│   ├── common/           # LoadingSpinner, ErrorAlert, StatusChip
│   └── layout/           # Navbar
├── context/              # AuthContext (session management)
├── services/             # API client, auth, applications
└── types/                # TypeScript interfaces
```

## Testing

- **Framework:** Jest + React Testing Library
- **Coverage:** 96%+ statements, 112 tests across 18 suites
- All pages, components, services, and context have full test coverage
