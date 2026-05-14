import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import { logger } from './logger'

const SLOW_QUERY_MS = 1000

function createPrismaClient() {
  return new PrismaClient()
    .$extends(withAccelerate())
    .$extends({
      query: {
        async $allOperations({ operation, model, args, query }: {
          operation: string
          model?: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          args: any
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          query: (args: any) => Promise<unknown>
        }) {
          const start = Date.now()
          try {
            const result = await query(args)
            const durationMs = Date.now() - start
            if (durationMs > SLOW_QUERY_MS) {
              logger.warn('db.slow_query', { model, operation, durationMs, threshold: SLOW_QUERY_MS })
              logger.flush()
            }
            return result
          } catch (err) {
            const durationMs = Date.now() - start
            logger.error('db.query_error', {
              model,
              operation,
              durationMs,
              error: err instanceof Error ? err.message : String(err),
              errorType: err instanceof Error ? err.name : undefined,
            })
            logger.flush()
            throw err
          }
        },
      },
    })
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

const globalForPrisma = global as unknown as { prisma: ExtendedPrismaClient }

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
