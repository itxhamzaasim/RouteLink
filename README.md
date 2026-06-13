# RouteLink

A modern ride-sharing platform built with Next.js, TypeScript, Tailwind CSS, and Shadcn UI. Inspired by Uber and BlaBlaCar.

## Tech Stack

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Shadcn UI**
- **Lucide React** icons

## Project Structure

```
RouteLink/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Protected dashboard routes
│   ├── login/
│   ├── register/
│   └── page.tsx            # Home page
├── components/
│   ├── auth/               # Login & register forms
│   ├── common/             # Shared UI (logo, etc.)
│   ├── dashboard/          # Dashboard layout components
│   ├── home/               # Landing page sections
│   ├── layout/             # Header, footer, navigation
│   ├── providers/          # React context providers
│   └── ui/                 # Shadcn UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities, constants, validations
├── services/               # API & auth service layer
├── types/                  # TypeScript type definitions
└── middleware.ts           # Route protection
```

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home page with ride search |
| `/login` | User login |
| `/register` | User registration |
| `/dashboard` | Main dashboard overview |
| `/dashboard/rides` | Driver rides management |
| `/dashboard/bookings` | Passenger bookings |
| `/dashboard/profile` | User profile |
| `/dashboard/settings` | Account settings |

## Authentication

Auth is structured for backend integration but uses **mock mode** by default:

- `services/auth.service.ts` — swap mock logic for real API calls
- `services/api-client.ts` — HTTP client ready for your API
- `middleware.ts` — protects `/dashboard/*` routes via session cookie
- `components/providers/auth-provider.tsx` — global auth state

**Demo login:** use any valid email and password (8+ characters).

Set `NEXT_PUBLIC_MOCK_AUTH=false` and `NEXT_PUBLIC_API_URL` when your backend is ready.

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

MIT
