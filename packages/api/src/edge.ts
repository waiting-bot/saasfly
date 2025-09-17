import { authRouter } from "./router/auth";
import { customerRouter } from "./router/customer";
import { generateRouter } from "./router/generate";
import { healthCheckRouter } from "./router/health_check";
import { k8sRouter } from "./router/k8s";
import { stripeRouter } from "./router/stripe";
import { createTRPCRouter } from "./trpc";

export const edgeRouter = createTRPCRouter({
  stripe: stripeRouter,
  healthCheck: healthCheckRouter,
  generate: generateRouter,
  k8s: k8sRouter,
  auth: authRouter,
  customer: customerRouter,
});
