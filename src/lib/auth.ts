import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { Adapter } from "@auth/core/adapters"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    role: string
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        // 1. Check Admin/User table
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string
          }
        })

        if (user && user.password) {
          const isCorrectPassword = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (isCorrectPassword) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            }
          }
        }

        // 2. Check Customer table
        const customer = await prisma.customer.findFirst({
          where: {
            OR: [
              { authorizedEmail: credentials.email as string },
              { username: credentials.email as string }
            ]
          }
        })

        if (customer && customer.loginPassword) {
          const isCorrectPassword = await bcrypt.compare(
            credentials.password as string,
            customer.loginPassword
          )

          if (isCorrectPassword) {
            return {
              id: customer.id,
              email: customer.authorizedEmail,
              name: customer.companyName,
              role: "CUSTOMER",
            }
          }
        }

        throw new Error("Invalid credentials")
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})
