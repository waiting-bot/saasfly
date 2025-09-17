// Mock handlers for development - disable NextAuth to avoid configuration issues
export const GET = () => new Response('Auth disabled in development', { status: 200 })
export const POST = () => new Response('Auth disabled in development', { status: 200 })