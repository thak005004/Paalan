import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      role?: string;
    };
  }
}

// Placeholder Auth.js v5 config.
//
// The credentials provider has been removed (magic-link only — D12). The full
// magic-link wiring (email provider + Drizzle adapter over the users/accounts/
// sessions/verificationTokens tables + delivery) lands in a later auth-specific
// task. For now this compiles and satisfies imports (handlers, auth, signIn,
// signOut) without an active provider. Auth is not exercised on the home page.
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [],
  session: { strategy: 'jwt' },
  callbacks: {
    session({ session, token }) {
      session.user.role = token.role as string | undefined;
      return session;
    }
  }
});
