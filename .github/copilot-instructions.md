# Varlixo Codebase Instructions

## Project Overview
**Varlixo** is a full-stack investment platform with:
- **Backend**: NestJS + MongoDB + JWT Auth with 2FA + Email service
- **Frontend**: Next.js 14 + React 18 + TailwindCSS + Zustand for state
- **Architecture**: Monorepo structure (backend/ and frontend/ folders)

## Backend Architecture (NestJS)

### Core Patterns
1. **Module-Based Organization**: Each feature (auth, wallet, investment, etc.) is a self-contained module
2. **Service Layer**: Business logic lives in `*.service.ts`, controllers only handle routing
3. **DTO Validation**: Use Zod/class-validator in `dto/` folders for request validation
4. **MongoDB Integration**: Mongoose schemas in `src/schemas/` with interfaces in `src/models/`

### Critical Modules & Their Responsibilities
| Module | Location | Key Exports |
|--------|----------|------------|
| **Auth** | `src/auth/` | JWT generation, user registration, 2FA setup, password reset |
| **Wallet** | `src/wallet/` | Balance management, deposits, withdrawals, transaction history |
| **Investment** | `src/investment/` | Investment plans, active investments, returns calculation |
| **Referral** | `src/referral/` | Referral codes, commission tracking, network rewards |
| **KYC** | `src/kyc/` | Identity verification documents, compliance status |
| **Admin** | `src/admin/` | User management, system logs, analytics dashboard |
| **Cron** | `src/cron/` | Scheduled tasks (daily returns, reward distributions) |

### Security & Guards
- **JWT Auth Guard** (`src/common/guards/jwt-auth.guard.ts`): Validates access tokens from `Authorization: Bearer {token}` header
- **Roles Guard** (`src/common/guards/roles.guard.ts`): Restricts endpoints by user role (admin, super_admin, user)
- **@Public() Decorator**: Marks endpoints that bypass JWT authentication (register, login, verify-email)
- **2FA Flow**: Optional second factor stored in user.twoFactorEnabled; email 2FA codes use in-memory Map (replace with Redis in production)

### Configuration Management
- **Config Service**: `src/config/configuration.ts` centralizes all env variables (database URI, JWT secrets, SMTP, admin credentials)
- **Environment Variables**: .env file in backend/ root - see DEPLOYMENT.md for required variables
- **Validation**: All config accessed via `configService.get<type>('path.to.value')`

### Common Issues & Patterns
- **Circular Dependencies**: Use `forwardRef()` in module imports (e.g., AuthModule → EmailModule)
- **Database Transactions**: MongoDB doesn't support ACID in single-instance; use sessions for multi-document operations
- **Rate Limiting**: Configured in AppModule via ThrottlerModule (60s TTL, 100 requests max by default)
- **CORS**: Frontend URL configured in environment - allows both localhost:3000 and production domain

### Development Commands
```bash
cd backend
npm install              # Install dependencies
npm run start:dev        # Watch mode (auto-reload)
npm run build           # Compile TypeScript to dist/
npm run start:prod      # Run compiled version
node scripts/fix-admin.js # Reset admin credentials
```

## Frontend Architecture (Next.js)

### Key Patterns
1. **API Client**: Centralized `app/lib/api.ts` with axios interceptors for auth token management
2. **Global State**: Zustand store (`app/lib/store.ts`) for user, wallet, and auth state
3. **Protected Routes**: Auth context checks before rendering dashboard pages
4. **Form Validation**: Zod schemas + React Hook Form for client validation
5. **Animations**: Framer Motion for transitions (fade-in, slide-up, scale-in variants)

### Route Structure
```
app/
  auth/login/           # Public: Login form
  auth/register/        # Public: Registration with referral code support
  dashboard/            # Protected: User dashboard with portfolio
    investments/        # Investment management
    wallet/             # Deposits, withdrawals, transactions
    referrals/          # Referral stats and link generation
    kyc/                # Identity verification upload
    settings/           # User preferences and security
  admin/                # Admin-only dashboard
  public/*              # Static pages: about, faq, terms, etc.
```

### Authentication Flow
1. **Login**: POST `/api/v1/auth/login` → returns `{ user, accessToken, refreshToken }`
2. **Store**: Tokens saved to cookies (js-cookie), user state in Zustand
3. **API Calls**: Interceptor adds `Authorization: Bearer {accessToken}` header
4. **Token Refresh**: On 401, POST `/api/v1/auth/refresh` with refreshToken
5. **Logout**: Clear cookies and reset Zustand store

### Styling & Theme
- **Tailwind Config**: `tailwind.config.js` defines custom brand colors (primary: #00d4aa), dark theme colors (dark-900 to dark-50)
- **Dark Mode**: Enabled via `darkMode: 'class'` - theme-toggle component manages `html.dark` class
- **Custom Animations**: `float`, `glow`, `slide-up`, `slide-down`, `fade-in`, `scale-in` defined in theme.extend.keyframes
- **Component Library**: Lucide React for icons, Recharts for data visualization, React Hot Toast for notifications

### Development Commands
```bash
cd frontend
npm install              # Install dependencies
npm run dev             # Start dev server (localhost:3000)
npm run build           # Build for production
npm run start           # Run production build
npm run lint            # Run ESLint
```

## Data Models & Flow

### Investment System
1. **Investment Plan**: Predefined (Starter: 1.5%/day, Growth: 2%/day, Premium: 3%/day)
2. **User Investment**: References plan, start/end dates, locked capital, daily returns accrued
3. **Cron Service**: Daily scheduled task calculates returns based on investment.dailyReturn × planDuration
4. **Withdrawal**: User can withdraw principal + accumulated returns after plan duration ends

### Referral System
- **Unique Code**: Each user gets 6-char code (generateReferralCode in helpers.ts)
- **Tracking**: Referral schema stores referrer ID, referral ID, commission %
- **Commission**: 5-10% of referred user's investment amounts (configured per plan)
- **Payout**: Manual admin withdrawal or automatic with referral earnings accrual

### KYC Flow
1. **Upload**: User submits ID, proof of residence documents
2. **Admin Review**: Admin marks as approved/rejected with comments
3. **Gate Features**: Investments and large withdrawals require kycStatus = 'approved'

## Integration Points

### Email Service (Resend SMTP)
- **Config**: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env
- **Used For**: Email verification, password reset, 2FA codes, investment confirmations
- **Implementation**: `src/email/email.service.ts` sends via nodemailer
- **Templates**: Plain text or basic HTML - no template engine currently

### Market Data (CoinGecko API)
- **Endpoint**: `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd`
- **Used For**: Display crypto prices in dashboard and market page
- **No Auth Required**: Public API, no rate limiting in config

### MongoDB Atlas
- **Connection**: Replica set URI with auth credentials in MONGODB_URI
- **Collections**: user, wallet, investment, referral, deposit, withdrawal, kyc, transaction, etc.
- **Indexing**: Add indexes on frequently queried fields (email, userId, status)

## Deployment

### Backend (Render.com)
- **Root Directory**: `backend/`
- **Build**: `npm install && npm run build`
- **Start**: `npm run start:prod`
- **Key Env Vars**: MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET, SMTP_PASS, FRONTEND_URL

### Frontend (Vercel)
- **Root Directory**: `frontend/`
- **Framework**: Next.js 14
- **Key Env Vars**: NEXT_PUBLIC_API_URL (backend base URL)
- **Auto-Deploy**: On push to main branch

## Code Style & Conventions

### NestJS Conventions
- File naming: `feature.controller.ts`, `feature.service.ts`, `feature.module.ts`
- Class decorators: `@Controller()`, `@Injectable()`, `@Module()`
- Method decorators: `@Post()`, `@Get()`, `@UseGuards()`, `@UseInterceptors()`
- Comment blocks: JSDoc-style with feature name and description

### TypeScript
- Strict null checks enabled in tsconfig
- Use explicit return types on functions
- Define interfaces for all data structures
- Avoid `any` type - use generics or union types

### Next.js Conventions
- Use `'use client'` for components with hooks or state
- Server components by default for static/data-fetching components
- API routes deprecated - use backend endpoints instead
- Avoid inline styles - use Tailwind classes

## Testing & Debugging

### Backend Debugging
- **VS Code Debugger**: Run with `npm run start:debug`, set breakpoints in src/
- **Logs**: LoggerMiddleware outputs request/response times
- **Database**: Connect MongoDB Compass to MONGODB_URI to inspect data
- **Email Testing**: Check email service logs - failed emails don't block requests

### Frontend Debugging
- **React DevTools**: Inspect Zustand store, component render performance
- **Network Tab**: Monitor API calls, token refresh behavior
- **Console Errors**: Handle API errors with toast notifications

## Common Tasks

### Add a New API Endpoint
1. Create DTO in `feature/dto/endpoint.dto.ts`
2. Add method to `feature.service.ts` with business logic
3. Add @Post/@Get/@Put method to `feature.controller.ts`
4. Optionally add @UseGuards(JwtAuthGuard) if auth required
5. Export in module's `providers` and `controllers` arrays

### Add New Investment Plan
1. Create object in investment-plan.schema.ts seed data
2. Seed via MongoDB or admin panel
3. Update frontend plans array in page.tsx
4. Verify daily return calculations in cron.service.ts

### Fix Admin Credentials
1. Run `node scripts/fix-admin.js` from backend root
2. Default email: admin@varlixo.com, password: Admin@123456
3. Change via admin dashboard after login

### Deploy to Production
1. Update FRONTEND_URL in backend env
2. Update NEXT_PUBLIC_API_URL in frontend env
3. Push to main branch
4. Render auto-deploys backend, Vercel auto-deploys frontend
5. Test auth flow end-to-end on production URL
