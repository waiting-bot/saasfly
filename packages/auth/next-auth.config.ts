import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { KyselyAdapter } from "@auth/kysely-adapter"
import { db } from "@saasfly/db"

import { env } from "./env.mjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: KyselyAdapter(db),
  providers: [
    GitHub({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (token?.sub && session?.user) {
        session.user.id = token.sub
      }

      // Check if user is admin
      if (env.ADMIN_EMAIL && session?.user?.email) {
        const adminEmails = env.ADMIN_EMAIL.split(",")
        session.user.isAdmin = adminEmails.includes(session.user.email)
      }

      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id
      }
      return token
    },
  },
  session: {
    strategy: "jwt",
  },
})