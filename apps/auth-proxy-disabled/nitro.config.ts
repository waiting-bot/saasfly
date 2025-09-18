import { defineNitroConfig } from "nitropack";

export default defineNitroConfig({
  preset: "vercel",
  srcDir: "./routes",
  routeRules: {
    "/**": {
      cors: true,
      headers: {
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  },
  runtimeConfig: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    AUTH_REDIRECT_PROXY_URL: process.env.AUTH_REDIRECT_PROXY_URL,
  },
  // 开发环境配置
  devServer: {
    port: 3001,
  },
  // 生产环境配置
  port: 3001,
});