import { NextResponse } from "next/server";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

import { i18n } from "./config/i18n-config";

function getLocale(request: Request): string | undefined {
  return i18n.defaultLocale;
}

export function middleware(request: Request) {
  const pathname = new URL(request.url).pathname;
  
  // 如果是API路径，直接返回，不进行locale处理
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)"
  ]
};
