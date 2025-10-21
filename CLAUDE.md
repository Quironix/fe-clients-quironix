# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quironix Frontend - A Next.js 15 enterprise application for financial management, debt collection, and client administration built with React 19, TypeScript, Tailwind CSS 4, and shadcn/ui components.

**Tech Stack:**

- **Framework:** Next.js 15 (App Router) with Turbopack
- **React:** 19.0.0
- **Auth:** NextAuth 5.0 (beta) with JWT strategy
- **State Management:** Zustand 5.0
- **Data Fetching:** TanStack Query (React Query) 5.x
- **UI Components:** Radix UI + shadcn/ui + Tabler Icons
- **Forms:** React Hook Form + Zod validation
- **Styling:** Tailwind CSS 4 with PostCSS

## Development Commands

```bash
# Development server (Turbopack enabled, port 5173)
npm run dev

# Development with webpack (when Turbopack has issues)
npm run dev:webpack

# Fast development (ESLint disabled)
npm run dev:fast

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format
npm run format:check

# Clean build artifacts
npm run clean

# Bundle analysis
npm run analyze
```

## Architecture

### Directory Structure

```
src/
├── app/
│   ├── (auth)/              # Auth route group
│   │   └── sign-in/         # Sign-in page with services
│   ├── dashboard/           # Protected dashboard area
│   │   ├── [module]/        # Module-based structure (see below)
│   │   ├── components/      # Shared dashboard components
│   │   └── layout.tsx       # Dashboard layout with sidebar
│   ├── onboarding/          # Client onboarding flow
│   ├── api/                 # API routes
│   │   └── auth/[...nextauth]/ # NextAuth handler
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # shadcn/ui components (45+ components)
│   ├── AuthLayout/          # Auth-related layouts
│   ├── Stepper/             # Multi-step form component
│   ├── PasswordInput/       # Custom password input
│   └── Loader/              # Loading component
├── stores/                  # Zustand global stores
│   ├── auth/                # Authentication store
│   ├── authLayout/          # Auth layout state
│   └── dashboard/           # Dashboard-specific stores
├── services/                # API service layer
│   ├── auth/                # Auth services
│   └── global/              # Shared API utilities
├── hooks/                   # Shared React hooks
├── lib/                     # Utility functions
│   ├── utils.ts             # cn() utility, date/number formatting
│   └── getDocumentTypeCode.ts
├── context/                 # React contexts
│   └── search-context.tsx   # Global search context
├── types.ts                 # Global TypeScript types
├── auth.ts                  # NextAuth configuration
└── middleware.ts            # Route protection & scope validation
```

### Dashboard Module Architecture

Each dashboard module (users, roles, debtor-management, payment-plans, etc.) follows this standard structure:

```
dashboard/[module]/
├── components/           # Module-specific components
├── services/            # API calls for this module
│   ├── index.ts         # Service functions (CRUD operations)
│   └── types.ts         # TypeScript types for API responses
├── store/               # Zustand store for module state
│   └── index.tsx        # Module store with CRUD operations
├── hooks/               # Module-specific hooks (optional)
├── types/               # Module-specific types (optional)
├── page.tsx             # Main module page
└── [id]/                # Dynamic routes (e.g., detail pages)
    └── page.tsx
```

**Key Modules:**

- `users/` - User management
- `roles/` - Role and permissions management
- `debtor-management/` - Debtor tracking and contact management
- `payment-plans/` - Payment plan configuration
- `payment-projection/` - Payment forecasting
- `cash-flow/` - Cash flow analysis
- `transactions/` - Transaction management
- `litigation/` - Legal process tracking
- `settings/` - System configuration
- `integrations/` - Third-party integrations (Fintoc)

### Module Generator

Use the included script to scaffold new modules:

```bash
./create-dashboard-module.sh <module-name>
```

This creates a complete module structure with:

- Service layer with GET/POST examples
- Zustand store with CRUD operations
- TypeScript types
- Page component with standard layout
- README documentation

**After generation:**

1. Update `services/index.ts` - replace `REPLACE_ENDPOINT` with actual API endpoint
2. Define types in `types/index.ts`
3. Customize `page.tsx` UI
4. Add components in `components/` directory
5. Update `middleware.ts` ROUTE_SCOPE_MAP if access control is needed

### Authentication & Authorization

**NextAuth Configuration (`src/auth.ts`):**

- Credentials provider with custom sign-in service
- JWT session strategy
- Custom session interface extending NextAuth's Session type

**Middleware (`src/middleware.ts`):**

- Route protection for `/dashboard/*` and `/onboarding/*`
- Profile caching (5-minute TTL) to reduce API calls
- Scope-based access control via `ROUTE_SCOPE_MAP`
- Client type validation (e.g., FACTORING-only routes)
- Status-based routing (INVITED → onboarding, others → dashboard)

**Access Token Flow:**

1. User signs in → receives JWT token
2. Token stored in NextAuth session
3. Middleware validates token and fetches profile
4. Profile contains client info, roles, and scopes
5. Scope validation determines route access

**Adding Protected Routes:**

```typescript
// In middleware.ts
const ROUTE_SCOPE_MAP: Record<string, string> = {
  "/dashboard/new-module": "client.module.scope_name",
};
```

### API Service Layer

**Pattern:**

```typescript
// services/index.ts
export async function getAll(accessToken: string, clientId: string) {
  const response = await fetch(`${API_URL}/v2/clients/${clientId}/resource`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("Failed to fetch");
  return response.json();
}
```

**Common Headers:**

- `Authorization: Bearer ${accessToken}` - Required for all authenticated requests
- `Content-Type: application/json` - For POST/PUT/PATCH

**API Base URL:** `process.env.NEXT_PUBLIC_API_URL`

### State Management Patterns

**Zustand Store Structure:**

```typescript
interface ModuleStore {
  items: Item[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fetchItems: (token: string, clientId: string) => Promise<void>;
  addItem: (item: Item, token: string, clientId: string) => Promise<void>;
  updateItem: (
    id: string,
    item: Item,
    token: string,
    clientId: string
  ) => Promise<void>;
  deleteItem: (id: string, token: string, clientId: string) => Promise<void>;
}
```

**Usage in Components:**

```typescript
const { items, loading, fetchItems } = useModuleStore();
const session = await auth();

useEffect(() => {
  if (session?.token && clientId) {
    fetchItems(session.token, clientId);
  }
}, [session?.token, clientId]);
```

### Form Handling

**Pattern with React Hook Form + Zod:**

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Minimum 2 characters"),
  email: z.string().email("Invalid email"),
});

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { name: "", email: "" },
});
```

### UI Component Patterns

**shadcn/ui components are in `src/components/ui/`:**

- Import from `@/components/ui/component-name`
- Customized with Tailwind CSS
- Use `cn()` utility from `@/lib/utils` for conditional classes

**Date Formatting:**

```typescript
import { formatDate, formatDateTime } from "@/lib/utils";

formatDate("2024-01-15"); // "15-01-2024" (Chile timezone)
formatDateTime("2024-01-15T10:30:00Z"); // "15-01-2024 10:30"
```

**Number Formatting:**

```typescript
import { formatNumber } from "@/lib/utils";

formatNumber(1000000); // "$1.000.000" (Chilean format)
formatNumber(1000000, false); // "1.000.000" (no currency symbol)
```

## Commit Conventions

Follow **Conventional Commits v1.0.0** (see `.cursor/rules/conventional-commits.mdc`):

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

**Types:**

- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation
- `style`: formatting (no code change)
- `refactor`: code change (no bug fix or feature)
- `perf`: performance improvement
- `test`: tests
- `build`: build system/dependencies
- `ci`: CI configuration
- `chore`: other changes

**Common Scopes:** `api`, `ui`, `auth`, `components`, `utils`, `config`, `types`, `hooks`, `services`

**Examples:**

```
feat(components): add UserCard component
fix(auth): resolve token expiration handling
refactor(services): simplify API client configuration
```

## Important Configuration Notes

### Next.js Configuration

- Build output: `build/` (not `.next/`)
- Standalone output enabled
- React Strict Mode: **disabled** (for performance)
- Turbopack: **enabled by default** in dev
- TypeScript strict mode: **disabled**
- Path alias: `@/*` → `./src/*`

### Environment Variables

Required environment variables (see `.env` and `.env.local`):

- `NEXT_PUBLIC_API_URL` - Backend API base URL
- `AUTH_SECRET` - NextAuth secret key
- `NEXTAUTH_URL` - Application URL for NextAuth

### TypeScript Configuration

- Target: ES2020
- Strict mode: **disabled**
- Module resolution: bundler
- Path alias: `@/*` → `./src/*`
- Watch optimization enabled for fast rebuilds

## Development Workflow

1. **Creating a new dashboard module:**

   ```bash
   ./create-dashboard-module.sh module-name
   ```

2. **Adding authentication to a route:**

   - Add route scope mapping in `src/middleware.ts`
   - Ensure backend API has corresponding scope

3. **Adding a new UI component:**

   - Use shadcn/ui CLI: `npx shadcn-ui@latest add [component]`
   - Or manually add to `src/components/ui/`

4. **Working with forms:**

   - Use React Hook Form + Zod for validation
   - Use shadcn/ui Form components for consistent styling

5. **API integration:**
   - Add service functions in module's `services/index.ts`
   - Define TypeScript types in `services/types.ts`
   - Integrate with Zustand store
   - Handle errors with toast notifications (sonner)

## Common Patterns

### Getting Session in Server Components

```typescript
import { auth } from "@/auth";

const session = await auth();
const token = session?.token;
```

### Getting Session in Client Components

```typescript
"use client";
import { useSession } from "next-auth/react";

const { data: session } = useSession();
const token = session?.token;
```

### Toast Notifications

```typescript
import { toast } from "sonner";

toast.success("Success message");
toast.error("Error message");
```

### Conditional Styling

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  variant === "primary" && "primary-classes"
)} />
```

## Troubleshooting

**Build errors with TanStack packages:**

- The project has custom webpack config to handle ESM modules from `@tanstack`
- If issues persist, check `next.config.ts` transpilePackages array

**Turbopack issues:**

- Use `npm run dev:webpack` to bypass Turbopack
- Check `next.config.ts` for Turbopack rules

**Type errors:**

- Run `npm run type-check` to see all TypeScript errors
- Note: strict mode is disabled for this project

**Authentication issues:**

- Check middleware logs in console
- Verify token is present in session
- Check profile cache (5-minute TTL)

**Module not accessible:**

- Verify scope mapping in `middleware.ts`
- Check user roles/scopes in profile
- Look for "Acceso denegado" logs in middleware

## Considerations

- Don't comment the code
