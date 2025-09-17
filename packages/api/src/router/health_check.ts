import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@saasfly/db";

export const healthCheckRouter = createTRPCRouter({
  health: publicProcedure
    .query(async () => {
      let dbStatus = "unknown";
      let dbError = null;
      
      // 测试数据库连接
      try {
        await db.selectFrom("customer").select("id").limit(1).execute();
        dbStatus = "connected";
      } catch (error) {
        dbStatus = "error";
        dbError = error instanceof Error ? error.message : "Unknown error";
      }

      return {
        status: dbStatus === "connected" ? "ok" : "degraded",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: dbStatus,
          error: dbError,
        },
      };
    }),
});
