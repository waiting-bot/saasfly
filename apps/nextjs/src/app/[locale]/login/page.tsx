"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@saasfly/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@saasfly/ui/card"
// import { Input } from "@saasfly/ui/input"
// import { Label } from "@saasfly/ui/label"
import { Github as GitHubIcon } from "lucide-react"
import { Loader } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const from = searchParams.get("from") || "/dashboard"

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push(from)
      }
    }
    checkSession()
  }, [router, from])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("github", { 
        callbackUrl: from,
        redirect: false 
      })
      
      if (result?.error) {
        setError("登录失败，请重试")
      } else {
        // GitHub OAuth会自动重定向
        router.push(from)
      }
    } catch (error) {
      setError("登录失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">登录</CardTitle>
          <CardDescription className="text-center">
            使用您的GitHub账户登录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                onClick={() => signIn("github", { callbackUrl: from })}
              >
                {isLoading ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GitHubIcon className="mr-2 h-4 w-4" />
                )}
                使用GitHub登录
              </Button>
            </div>
            {error && (
              <div className="text-sm text-red-600 text-center">{error}</div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}