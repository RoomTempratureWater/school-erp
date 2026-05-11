import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyToken } from './auth';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const createPrismaClient = () => {
  const basePrisma = new PrismaClient({ adapter });

  return basePrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const writeOperations = ['create', 'update', 'delete', 'createMany', 'updateMany', 'deleteMany', 'upsert'];
          if (writeOperations.includes(operation)) {
            let userId = null;
            try {
              const cookieStore = await cookies();
              const token = cookieStore.get('auth_token')?.value;
              if (token) {
                const session = await verifyToken(token);
                if (session) userId = session.userId;
              }
            } catch (e) {
              // Ignore errors (e.g. not running in a Next.js request context)
            }

            if (userId) {
              return basePrisma.$transaction(async (tx: any) => {
                await tx.$executeRawUnsafe(`SELECT set_config('school_app.internal_user_id', '${userId}', true)`);
                return tx[model][operation](args);
              });
            }
          }
          return query(args);
        },
      },
    },
  });
};

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = global as unknown as { prismaV2: ExtendedPrismaClient };

export const prisma = globalForPrisma.prismaV2 || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaV2 = prisma;
