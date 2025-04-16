/**
 * Route configuration for the application
 * This file defines which routes are public and which require authentication
 */

// Routes that don't require authentication
export const publicRoutes = [
  "/", // Landing page is public
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// Routes that require authentication
export const protectedRoutes = [
  "/dashboard",
  "/accounts",
  "/accounts/new",
  "/accounts/[id]",
  "/transactions",
  "/transactions/new",
  "/transactions/[id]",
  "/credits",
  "/recurring-payments",
  "/recurring-payments/new",
  "/recurring-payments/[id]",
  "/transfers",
  "/settings",
];

// Routes that should redirect authenticated users to dashboard
export const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/", // Optionally, redirect from landing page if already authenticated
];

export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
export const DEFAULT_LOGOUT_REDIRECT = "/login";

/**
 * Check if a route is public (doesn't require authentication)
 * @param pathname - The current pathname
 * @returns boolean - True if the route is public
 */
export const isPublicRoute = (pathname: string): boolean => {
  return (
    publicRoutes.includes(pathname) ||
    publicRoutes.some(
      (route) => route.endsWith("*") && pathname.startsWith(route.slice(0, -1))
    )
  );
};

/**
 * Check if a route requires authentication
 * @param pathname - The current pathname
 * @returns boolean - True if the route requires authentication
 */
export const isProtectedRoute = (pathname: string): boolean => {
  return (
    protectedRoutes.includes(pathname) ||
    protectedRoutes.some((route) => pathname.startsWith(route + "/"))
  );
};

/**
 * Check if a route should redirect authenticated users
 * @param pathname - The current pathname
 * @returns boolean - True if authenticated users should be redirected
 */
export const isAuthRoute = (pathname: string): boolean => {
  return authRoutes.includes(pathname);
};
