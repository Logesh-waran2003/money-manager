# Authentication System Documentation

This document provides a comprehensive overview of the authentication system in the Money Manager application, including its current implementation, identified issues, and recommendations for improvement.

## Current Authentication Flow

### User Authentication Process

1. **Registration**:
   - Users register with name, email, and password via `/api/auth/register`
   - Password is hashed using bcrypt before storage
   - JWT token is generated and returned to the client
   - Default categories are created for new users

2. **Login**:
   - Users login with email and password via `/api/auth/login`
   - Password is verified against the hashed version in the database
   - JWT token is generated and returned to the client

3. **Token Storage**:
   - JWT tokens are stored in the Zustand store with persistence
   - The token is used for subsequent authenticated requests

4. **Route Protection**:
   - Middleware checks if routes require authentication
   - Public routes are defined in `lib/routes.ts`
   - API routes return 401 for unauthorized requests
   - Page routes redirect to login with a callback URL

5. **Token Verification**:
   - JWT tokens are verified in the `getAuthUser` function
   - Tokens can be provided via Authorization header or cookies

## Authentication Components

### Server-Side Components

1. **Auth Library (`lib/auth.ts`)**:
   - `getAuthUser`: Extracts and verifies JWT from request
   - `getCurrentUser`: Gets the current authenticated user
   - `authMiddleware`: Middleware for route protection

2. **Middleware (`middleware.ts`)**:
   - Protects routes based on authentication status
   - Redirects unauthenticated users to login
   - Allows public routes without authentication

3. **Auth API Routes**:
   - `/api/auth/login`: Authenticates users and issues tokens
   - `/api/auth/register`: Creates new users and issues tokens
   - `/api/auth/reset-password`: Handles password reset requests

### Client-Side Components

1. **Auth Store (`lib/stores/useAuthStore.ts`)**:
   - Manages authentication state
   - Handles login, register, and logout operations
   - Persists authentication data between sessions

2. **Auth Helper Functions**:
   - `fetchWithAuth`: Adds authentication token to requests

3. **Login/Register Pages**:
   - Form handling for authentication
   - Error display and validation

## Environment Configuration

Authentication relies on the following environment variables:

- `JWT_SECRET`: Secret key for signing JWT tokens
- `JWT_EXPIRES_IN`: Token expiration time (default: "7d")
- `MOCK_AUTH`: Flag to enable/disable mock authentication in development

## Issues Identified

### 1. Hard-coded Authentication Bypass

```javascript
// lib/stores/useAuthStore.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // For development, set isAuthenticated to true with an existing user ID
      token: "mock-token-for-development",
      user: {
        id: "cm91y74jd0000ime8za4jbuby", // Using the existing user ID from the database
        name: "Test User",
        email: "test@example.com",
      },
      isAuthenticated: true,
      // ...
```

This hard-coded mock token and user will cause all users to be automatically logged in with the same test user account, bypassing actual authentication.

### 2. Environment Variable Inconsistencies

- `.env` and `.env.production` files don't have consistent variables
- No `MOCK_AUTH` flag to control authentication behavior
- `NODE_ENV` is commented out in both files

### 3. JWT Secret Security Issues

- `.env.production` has a placeholder JWT secret: `"your-production-jwt-secret-key-here"`
- The login route uses a fallback secret if JWT_SECRET is not set, but register route doesn't check

### 4. Missing Token Refresh Mechanism

- No mechanism to refresh tokens before they expire
- Users will need to log in again after token expiration

### 5. Inconsistent Error Handling

- Some routes return `error` property in responses, others use `message`
- This can cause inconsistent error handling in the frontend

### 6. No CSRF Protection

- No CSRF tokens or other protection mechanisms are implemented
- This could make the application vulnerable to CSRF attacks

### 7. Middleware Configuration Issues

- The middleware matcher pattern might not be comprehensive enough
- Some static assets might be unnecessarily processed by the middleware

### 8. Incomplete Navigation After Authentication

- The login page doesn't redirect users after successful login
- No handling of the `callbackUrl` parameter that's set in the middleware

### 9. No Token Invalidation on Logout

- The logout function only removes the token from the store
- No server-side token invalidation mechanism

### 10. Inconsistent User ID References

- Different user IDs are referenced in different parts of the code:
  - `cm91y74jd0000ime8za4jbuby` in useAuthStore.ts
  - Different IDs might be used elsewhere

## Recommendations for Improvement

### 1. Remove Hard-coded Authentication

```javascript
// Updated useAuthStore.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      // ... rest of the implementation
    }),
    // ... persist configuration
  )
);
```

### 2. Standardize Environment Variables

```
# .env.example
# Authentication
JWT_SECRET="your-jwt-secret-key-here"
JWT_EXPIRES_IN="7d"
MOCK_AUTH="true"  # Set to "true" for development, "false" for production
NODE_ENV="development"
```

### 3. Improve JWT Security

```javascript
// Updated login route
// Generate JWT token
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}
const token = sign({ userId: user.id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || "7d",
});
```

### 4. Add Token Refresh

```javascript
// New refresh token endpoint
export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json();
    
    // Verify refresh token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set");
    }
    
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (typeof payload !== "object" || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    
    // Generate new access token
    const newToken = sign(
      { userId: payload.userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    
    return NextResponse.json({ token: newToken });
  } catch (error) {
    return NextResponse.json({ error: "Failed to refresh token" }, { status: 401 });
  }
}
```

### 5. Standardize Error Handling

```javascript
// Error response helper
function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Usage in routes
if (!email || !password) {
  return errorResponse("Email and password are required", 400);
}
```

### 6. Add CSRF Protection

```javascript
// Add CSRF token to forms
<form onSubmit={handleSubmit} className="space-y-4">
  <input type="hidden" name="csrfToken" value={csrfToken} />
  {/* ... rest of the form */}
</form>

// Verify CSRF token in API routes
const { csrfToken } = await request.json();
if (!validateCsrfToken(csrfToken)) {
  return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
}
```

### 7. Improve Middleware Configuration

```javascript
// Updated middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
```

### 8. Complete Authentication Flow

```javascript
// Updated login page
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const success = await login(email, password);
  if (success) {
    // Get callback URL from query params or default to dashboard
    const params = new URLSearchParams(window.location.search);
    const callbackUrl = params.get("callbackUrl") || "/dashboard";
    router.push(callbackUrl);
  }
};
```

### 9. Implement Token Invalidation

```javascript
// Updated logout function
logout: async () => {
  try {
    // Call logout API to invalidate token on server
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${useAuthStore.getState().token}`
      }
    });
  } catch (error) {
    console.error('Error during logout:', error);
  }
  
  // Clear client-side state
  set({
    token: null,
    user: null,
    isAuthenticated: false,
  });
},
```

### 10. Standardize User References

Use environment variables or configuration files for development user IDs:

```javascript
// config/development.ts
export const DEV_USER_ID = "dev-user-id";

// Usage
import { DEV_USER_ID } from "@/config/development";

// ...
id: DEV_USER_ID,
```

## Security Best Practices

1. **Use HTTPS**: Always use HTTPS in production to encrypt data in transit.

2. **Secure JWT Storage**: Store JWTs in HttpOnly cookies when possible to prevent XSS attacks.

3. **Token Expiration**: Use short-lived tokens (e.g., 15-60 minutes) with refresh tokens for better security.

4. **Password Policies**: Enforce strong password policies (minimum length, complexity).

5. **Rate Limiting**: Implement rate limiting on authentication endpoints to prevent brute force attacks.

6. **Audit Logging**: Log authentication events (login, logout, failed attempts) for security monitoring.

7. **Multi-Factor Authentication**: Consider adding MFA for enhanced security.

## Conclusion

The current authentication system provides basic functionality but has several security and implementation issues that should be addressed. By implementing the recommendations above, the authentication system will be more secure, reliable, and maintainable.

---

_Last updated: 2025-04-16_
