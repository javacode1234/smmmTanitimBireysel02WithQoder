import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Debug: Verify prisma is initialized
if (!prisma) {
  console.error('❌ FATAL: Prisma client is undefined!')
} else {
  console.log('✅ Prisma client initialized successfully')
}
