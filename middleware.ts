import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default async function middleware(req: NextRequest) {
  if (!hasClerk) {
    return NextResponse.next();
  }

  // Dynamically import Clerk only when keys are configured
  const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server');
  const isAdminRoute = createRouteMatcher(['/admin(.*)']);

  return clerkMiddleware((auth, request) => {
    if (isAdminRoute(request)) {
      auth().protect();
    }
  })(req, {} as any);
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
