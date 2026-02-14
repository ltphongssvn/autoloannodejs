# autoloannodejs/SECURITY.md
# Security Best Practices Implementation

## Secret Management Implementation

### 1. Pre-commit Secret Detection Setup

**Installation:**
```bash
pip install pre-commit detect-secrets
```

**Configuration (.pre-commit-config.yaml):**
```yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.5.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
        exclude: .*\.lock|.*\.log|package-lock\.json
```

**Activation:**
```bash
detect-secrets scan > .secrets.baseline
pre-commit install
```

### 2. Environment Variables Required

Create `.env` file (never commit):
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/autoloan_development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=autoloan_development
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=3600

# Email/SMTP
SMTP_ADDRESS=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Frontend
FRONTEND_URL=http://localhost:5173

# Node Environment
NODE_ENV=development
PORT=3000
```

### 3. Security Measures Implemented

| Layer | Tool/Practice | Purpose |
|-------|--------------|---------|
| Secret Detection | detect-secrets + pre-commit | Prevent secrets from entering codebase |
| .env Protection | pre-commit hook `check-env-files` | Block .env files from being committed |
| Dependencies | npm audit | Scan for vulnerable packages |
| HTTP Headers | helmet.js | OWASP security headers |
| Rate Limiting | express-rate-limit | Prevent brute force / DDoS |
| Input Validation | joi | Validate all request payloads |
| Authentication | JWT + bcryptjs | Stateless token-based auth |
| Authorization | Role-based middleware | Customer / Loan Officer / Underwriter |
| CORS | cors middleware | Restrict cross-origin requests |
| SQL Injection | Sequelize ORM (parameterized queries) | Prevent SQL injection |
| Password Hashing | bcryptjs (12 rounds) | Secure password storage |
| MFA | otplib (TOTP) | Two-factor authentication |

### 4. Pre-commit Workflow

Every commit now automatically:
1. Scans for secrets using detect-secrets
2. Blocks commit if new secrets found
3. Blocks .env files from being committed
4. Validates JSON and YAML files
5. Runs ESLint for code quality
6. Runs Prettier for formatting
7. Runs Jest for quick tests

**Manual scan:**
```bash
pre-commit run --all-files
```

### 5. Team Guidelines

- Never commit `.env` files
- Use environment variables for all credentials
- Run `pre-commit install` after cloning
- Review `.secrets.baseline` changes carefully
- Rotate any accidentally exposed keys immediately
- Run `npm audit` regularly to check for vulnerable dependencies
- Keep all dependencies updated

### 6. Dependency Security Audit
```bash
# Check for known vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix

# Full report
npm audit --json
```

## Verification
```bash
$ pre-commit run --all-files
Detect secrets...........................................................Passed
Block Large Binary Files.................................................Passed
Block .env Files.........................................................Passed
Fix Line Endings to LF..................................................Passed
Fix End of Files.........................................................Passed
Trim Trailing Whitespace.................................................Passed
Validate JSON Files......................................................Passed
Validate YAML Files......................................................Passed
Check for Large Files....................................................Passed
ESLint Check (CI Mirror).................................................Passed
Prettier Format Check (CI Mirror)........................................Passed
Jest Quick Tests (CI Mirror).............................................Passed
```

All secrets removed and pre-commit protection active.
