import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.internalUser.upsert({
    where: { userid: 'admin' },
    update: { id: 1 },
    create: { id: 1, userid: 'admin', password: 'password' }
  });
  console.log('InternalUser seeded successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
