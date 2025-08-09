import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicROute = createRouteMatcher(['/', '/sign-in(.*)', 'sign-up(.*)',])

export default clerkMiddleware(async (auth, request) => {
    const user = auth()
    const userId = (await user).userId
    const url = new URL(request.url)

    if (userId && isPublicROute(request) && url.pathname !== '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url)
        )
    }

    // Protect non-public routes 
    if (!isPublicROute(request)) {
        await auth.protect()
    }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}