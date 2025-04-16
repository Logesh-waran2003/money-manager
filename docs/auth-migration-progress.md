# Authentication System Progress Tracker (as of 2025-04-17)

## High Priority Issues (Address ASAP)

- [ ] **JWT Storage Security**
  - JWT is currently stored in Zustand/localStorage, which is vulnerable to XSS. Move to HttpOnly cookies if possible.
- [ ] **Token Refresh/Expiry Handling**
  - No refresh token or auto-logout on expiry. Implement refresh token flow or auto-logout.
- [ ] **Password Reset Token Exposure**
  - Password reset token is returned in API response (for demo). Never do this in production—send via email only.
- [x] **API Route Consistency**
  - All API routes now use `getAuthUser(request)` for authentication. Deprecated `auth()` has been removed.
- [ ] **Error Message Hardening**
  - Some error messages may reveal too much (user enumeration). Standardize and harden error responses.

## Medium Priority

- [ ] **Token Invalidation on Logout**
  - No server-side token invalidation. Consider implementing a blacklist or short expiry for sensitive actions.
- [ ] **CSRF Protection**
  - Not needed for Authorization header, but required if JWTs are moved to cookies.
- [ ] **Rate Limiting & Brute-Force Protection**
  - No rate limiting on auth endpoints. Add to prevent brute-force attacks.
- [ ] **Email Verification**
  - No email verification on registration. Add for better security.
- [x] **Callback URL Handling**
  - Login and registration now redirect to callbackUrl after authentication, improving user experience when accessing protected pages directly.

## Low Priority / Enhancements

- [ ] **Multi-Factor Authentication (MFA)**
  - Not implemented. Optional for higher security.
- [ ] **Audit Logging**
  - No logging of auth events (login, logout, failed attempts). Add for monitoring.
- [ ] **Password Policy Enforcement**
  - No strong password policy enforced. Add for better security.
- [ ] **Standardize User ID References**
  - Ensure consistent user ID usage across codebase.
- [ ] **Dev-Only Endpoints**
  - Double-check all dev-only endpoints (e.g., /api/seed) are blocked in production.

---

**Status:**

- Basic JWT authentication is working and all mock/bypass logic has been removed.
- Route protection and middleware are consistent and centralized.
- All API routes now use `getAuthUser(request)` for authentication, matching the cloud-first architecture described in docs/architecture-approaches.md.
- See above for remaining issues and priorities.

_Last updated: 2025-04-17_
