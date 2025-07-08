# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Primary Commands
- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build production application  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Development Server
The application runs on `http://localhost:3000` and uses hot reloading for development.

## Architecture Overview

### Framework & Stack
- **Next.js 15** with App Router and React Server Components
- **TypeScript** with strict type checking
- **Tailwind CSS** for styling with Shadcn/ui components
- **NextAuth.js v5** for authentication with JWT strategy
- **React Hook Form** with Zod validation
- **Zustand** for global state management
- **Fintoc** integration for banking services

### Application Structure
This is a multi-tenant financial management platform (Quironix) focused on debt management and factoring operations.

**Key Modules:**
- **Authentication & Onboarding**: Multi-step registration with contract signing and 2FA
- **Dashboard**: Central hub with role-based navigation and analytics
- **User Management**: Role-based access control with scope permissions
- **Financial Operations**: DTE processing, payments, and bank reconciliation
- **Company Management**: FACTORING client-specific company administration  
- **Debtor Management**: Comprehensive debtor tracking with bulk operations
- **Transaction Management**: Movements, DTEs, and payment processing

### Authentication Architecture
- **NextAuth.js v5** with JWT strategy
- **Middleware-based** route protection (`src/middleware.ts`)
- **Role-based access control** with scope-based permissions
- **Client-type validation** (FACTORING vs other client types)
- **Multi-step onboarding** with contract signing and 2FA setup

### State Management Patterns
- **Zustand stores** for global state in `src/stores/`
- **React Context** for shared application state (`src/context/`)
- **React Hook Form** for form state management
- **Server state** handled through service layers

### Component Organization
- **Shadcn/ui components** in `src/components/ui/`
- **Reusable form components** for consistent UX
- **Module-specific components** in feature directories
- **Data tables** with sorting, filtering, and pagination
- **Stepper components** for multi-step processes

### Service Layer Pattern
- **Domain-specific services** in each module's `services/` directory
- **Global services** in `src/services/`
- **Consistent error handling** and loading states
- **Token-based authentication** for API calls
- **Type-safe API integration** with Zod schemas

### Form Handling
- **React Hook Form** with Zod validation schemas
- **Reusable form components** (select dropdowns, date pickers, etc.)
- **Bulk operations** with Excel/CSV upload capabilities
- **Multi-step forms** with progress tracking

### Route Protection
The application uses comprehensive middleware (`src/middleware.ts`) for:
- Authentication validation
- Role-based access control  
- Client-type specific routing
- Scope-based permissions

### Key File Locations
- Authentication config: `src/auth.ts`
- Global types: `src/types.ts`
- Route middleware: `src/middleware.ts`
- Global styles: `src/app/globals.css`
- Environment configuration: Next.js standard `.env` files

## Important Development Notes

### Client Types
The application supports different client types with FACTORING being the primary focus. Client-specific features are controlled through the authentication system.

### Bulk Operations
Many modules support bulk data operations with Excel/CSV upload functionality. This is a core feature pattern throughout the application.

### Multi-step Processes
The application frequently uses multi-step processes (onboarding, debtor creation, etc.) with consistent stepper components and state management.

### Form Validation
All forms use Zod schemas for validation with TypeScript integration. Form components are designed for reusability across modules.

### Error Handling
The application implements consistent error handling patterns with user-friendly error messages and loading states.

## Commit Message Guidelines

Follow Conventional Commits format as specified in `.cursor/rules/conventional-commits.mdc`:
- Use types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- Include scope when relevant: `feat(auth):`, `fix(ui):`, etc.
- Use present tense, lowercase descriptions
- Common scopes: `api`, `ui`, `auth`, `components`, `utils`, `config`, `types`, `hooks`, `services`