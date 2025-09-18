import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
  shared: {
    NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_PRODUCT_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID: z.string().optional(),
    NEXTAUTH_URL: z.string(),
  },
  server: {
    NEXTAUTH_URL: z.string(),
    NEXTAUTH_SECRET: z.string().min(1),
    RESEND_API_KEY: z.string().min(1).optional(),
    COZE_API_KEY: z.string().min(1).optional(),
    COZE_API_URL: z.string().default("https://api.coze.cn"),
    WORKFLOW_ID: z.string().min(1).optional(),
  },
  // Client side variables gets destructured here due to Next.js static analysis
  // Shared ones are also included here for good measure since the behavior has been inconsistent
  runtimeEnv: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    COZE_API_KEY: process.env.COZE_API_KEY,
    COZE_API_URL: process.env.COZE_API_URL,
    WORKFLOW_ID: process.env.WORKFLOW_ID,
    NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID:
      process.env.NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID,
    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID:
      process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID:
      process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_BUSINESS_PRODUCT_ID:
      process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRODUCT_ID,
    NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID:
      process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID:
      process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID,
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
});
