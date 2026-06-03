export { auth as middleware } from '@/lib/auth';

// Don't invoke Middleware on these paths.
// /confirm/* is the parent/helper magic-link surface — public by design.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|confirm|login).*)'
  ]
};
