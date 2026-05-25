import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.paymentTransaction.deleteMany();
  await prisma.studentFee.deleteMany();
  await prisma.feeCategory.deleteMany();
  await prisma.mark.deleteMany();
  await prisma.studentPromotion.deleteMany();
  await prisma.studentDocument.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.student.deleteMany();
  console.log('Students deleted successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
