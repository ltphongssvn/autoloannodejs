# AutoLoan Frontend

Next.js 15 frontend for the AutoLoan application with TypeScript, Tailwind CSS, and Jest.

## Architecture
```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── login/              # Login
│   ├── signup/             # Registration
│   ├── dashboard/          # Customer dashboard
│   ├── applications/
│   │   ├── new/            # Multi-step application form
│   │   └── [id]/           # Application detail
│   │       └── agreement/  # Loan agreement & signature
│   ├── officer/            # Loan officer dashboard
│   │   └── review/[id]/    # Officer review page
│   ├── underwriter/        # Underwriter dashboard
│   │   └── review/[id]/    # Underwriter analysis page
│   ├── settings/           # Profile, password, MFA
│   ├── forgot-password/
│   ├── reset-password/
│   ├── confirm-email/
│   └── account-locked/
├── components/
│   ├── common/             # Shared UI components
│   │   ├── LoadingSpinner
│   │   ├── ErrorAlert
│   │   ├── StatusChip
│   │   ├── DocumentManager
│   │   └── MfaSettings
│   └── layout/
│       └── Navbar
├── context/
│   └── AuthContext          # JWT auth state management
├── services/
│   ├── api.ts              # Base fetch wrapper with JWT
│   ├── auth.ts             # Login, signup, password reset
│   ├── applications.ts     # CRUD + submit, sign
│   ├── documents.ts        # Upload, list, delete
│   ├── mfa.ts              # MFA setup, enable, disable
│   └── cable.ts            # WebSocket real-time updates
└── types/
    └── index.ts            # TypeScript interfaces
```

## Setup
```bash
npm install
cp env.local.example .env.local  # Configure API URL
npm run dev                       # http://localhost:3000
```

## Testing
```bash
npm test                    # Run all tests
npm test -- --coverage      # With coverage report
npm test -- --watch         # Watch mode
```

- **29 test suites, 201 tests**
- **Coverage: 94%+ statements, 85%+ branches, 96%+ lines**

## Docker
```bash
docker build -t autoloan-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://backend:3001 autoloan-frontend
```

## Deployment

Railway deployment configured via `railway.json`. Set `NEXT_PUBLIC_API_URL` environment variable to the backend URL.

## User Flows

1. **Customer**: Signup → Login → Dashboard → New Application (5 steps) → Submit → View Detail → Upload Documents → Sign Agreement
2. **Loan Officer**: Login → Officer Dashboard → Review → Approve/Reject/Request Docs
3. **Underwriter**: Login → Underwriter Dashboard → Analyze → Approve with Terms / Deny
