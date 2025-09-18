import { match as matchLocale } from "@formatjs/intl-localematcher";
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import Negotiator from "negotiator";
import auth from "../server/auth"

import { i18n } from "~/config/i18n-config";
import { env } from "@saasfly/auth/env.mjs";

const noNeedProcessRoute = [".*\\.png", ".*\\.jpg", ".*\\.opengraph-image.png"];

const noRedirectRoute = ["/api(.*)", "/trpc(.*)", "/admin"];

export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    /\/(\w{2}\/)?signin(.*)/,
    /\/(\w{2}\/)?terms(.*)/,
    /\/(\w{2}\/)?privacy(.*)/,
    /\/(\w{2}\/)?docs(.*)/,
    /\/(\w{2}\/)?blog(.*)/,
    /\/(\w{2}\/)?pricing(.*)/,
    /^\/\w{2}$/, // root with locale
    /\/(\w{2}\/)?login(.*)/, // login pages
  ];
  
  return publicRoutes.some(route => route.test(pathname));
}

export function getLocale(request: NextRequest): string | undefined {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
  const locales = Array.from(i18n.locales);
  // Use negotiator and intl-localematcher to get best locale
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales,
  );
  return matchLocale(languages, locales, i18n.defaultLocale);
}

export function isNoRedirect(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  return noRedirectRoute.some((route) => new RegExp(route).test(pathname));
}

export function isNoNeedProcess(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  return noNeedProcessRoute.some((route) => new RegExp(route).test(pathname));
}

export async function middleware(request: NextRequest) {
  if (isNoNeedProcess(request)) {
    return NextResponse.next();
  }

  const isWebhooksRoute = request.nextUrl.pathname.startsWith("/api/webhooks/");
  if (isWebhooksRoute) {
    return NextResponse.next();
  }
  
  const pathname = request.nextUrl.pathname;
  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );
  // Redirect if there is no locale
  if (!isNoRedirect(request) && pathnameIsMissingLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
        request.url,
      ),
    );
  }

  // Check if public route
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const session = await auth()
  const isAuth = !!session?.user;
  const isAdmin = session?.user?.isAdmin || false;

  const isAuthPage = /^\/[a-zA-Z]{2,}\/(login|register)/.test(pathname);
  const isAuthRoute = pathname.startsWith("/api/trpc/");
  const locale = getLocale(request) || "en";
  
  if (isAuthRoute && isAuth) {
    return NextResponse.next();
  }
  
  if (pathname.startsWith("/admin/dashboard")) {
    if (!isAuth || !isAdmin) {
      return NextResponse.redirect(new URL(`/admin/login`, request.url));
    }
    return NextResponse.next();
  }
  
  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
    return NextResponse.next();
  }
  
  if (!isAuth) {
    let from = pathname;
    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }
    return NextResponse.redirect(
      new URL(`/${locale}/login?from=${encodeURIComponent(from)}`, request.url),
    );
  }
  
  return NextResponse.next();
}