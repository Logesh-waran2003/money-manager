import { betterAuth } from "better-auth";

const providers: any[] = [
  // Add your providers, e.g.:
  // betterAuth.providers.credentials({ ... })
];

const callbacks = {
  async signIn(user: any, account: any, profile: any) {
    // Custom sign-in logic
    return true;
  },
  async session(session: any, user: any) {
    // Custom session logic
    return session;
  },
  async jwt(token: any, user: any, account: any, profile: any, isNewUser: any) {
    // Custom JWT logic
    return token;
  },
};

const options = {
  providers,
  // Remove the unsupported 'strategy' and 'maxAge' properties.
  // If you need to configure session, use the correct structure as per BetterAuthOptions.
  // For example, you might use:
  // session: {
  //   modelName: "Session",
  //   fields: { ... },
  //   freshAge: 3600,
  // },
  callbacks,
};

export const betterAuthInstance = betterAuth(options);
