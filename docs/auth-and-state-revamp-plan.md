# Auth & State Management Revamp Plan

## 1. Current Situation

- **Auth**: Multiple, partially deprecated auth stores (`useAuthStore.ts`, `auth-store.ts`, `user-store.ts`), some with legacy logic.
- **Zustand**: Used for auth, user, accounts, categories, transactions, credits, etc. Some stores are redundant or not DRY.
- **TanStack Query**: Used for some data fetching (accounts, categories), but not consistently across all entities.
- **Auth logic**: Scattered, with hardcoded dev user and incomplete JWT/session handling.
- **Goal**: Clean up, unify, and modernize state management and authentication.

---

## 2. Recommended Plan

### A. Remove All Auth and Zustand Logic Temporarily

- Remove all Zustand stores related to auth, user, and possibly others.
- Remove all authentication checks and logic from API routes and middleware (temporarily).
- Use a hardcoded user or no user at all in the backend for now.

### B. Refactor Data Fetching to Use TanStack Query Everywhere

- Refactor all data fetching (accounts, categories, transactions, credits, etc.) to use TanStack Query hooks.
- Remove any redundant Zustand stores that only mirror server state.

### C. Reintroduce Authentication (after app works without it)

1. **Choose Auth Strategy**: Use JWT with HttpOnly cookies, NextAuth.js, or Clerk/Auth0 (recommended for Next.js).
2. **Implement Auth API**: Add `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, etc.
3. **Protect API Routes**: Use middleware to check authentication.
4. **Expose Auth State**: Use TanStack Query or React Context for auth state (avoid Zustand for auth unless you have a strong reason).
5. **Update UI**: Show/hide UI based on auth state.

### D. Use Zustand Only for Local UI State (if needed)

- Keep Zustand for things like sidebar open/close, theme, etc.
- Do not use Zustand for server data (accounts, categories, etc.).

---

## 3. Summary of Steps

1. Remove all auth and Zustand logic (except for local UI state).
2. Refactor all data fetching to TanStack Query.
3. Get the app working without authentication.
4. Reintroduce authentication cleanly.
5. Protect API routes and expose auth state via TanStack Query or React Context.
6. Use Zustand only for local UI state.

---

## 4. Is this a good approach?

**Yes, this is a solid, modern approach.**

- It avoids legacy/dead code.
- It leverages TanStack Query for server state.
- It keeps local state simple with Zustand (if needed).
- It allows you to add authentication in a clean, maintainable way.

---

_Refer to this plan as you refactor and rebuild your authentication and state management!_
