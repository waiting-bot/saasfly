import Link from "next/link"

import { Button } from "@saasfly/ui"

export default function HomePage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold">欢迎使用 SaaSfly</h1>
        <p className="text-lg text-muted-foreground">
          现代化的 SaaS 应用程序脚手架，使用 NextAuth.js 进行身份验证
        </p>
        <div className="space-y-4">
          <Link href="/zh/login">
            <Button className="w-full">
              使用 GitHub 登录
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}