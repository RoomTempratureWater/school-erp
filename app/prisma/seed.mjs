import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.student.upsert({
    where: { enrollmentNo: 'ENR-2023-001' },
    update: {},
    create: {
      enrollmentNo: 'ENR-2023-001',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('2005-04-12'),
      standard: '10',
      division: 'A',
      parentName: 'Michael Doe',
      contactNumber: '555-0101',
    },
  });
  
  await prisma.student.upsert({
    where: { enrollmentNo: 'ENR-2023-002' },
    update: {},
    create: {
      enrollmentNo: 'ENR-2023-002',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: new Date('2006-08-22'),
      standard: '9',
      division: 'B',
      parentName: 'Sarah Smith',
      contactNumber: '555-0102',
    },
  });

  const studentAbizer = await prisma.student.upsert({
    where: { enrollmentNo: 'ENR-2025-001' },
    update: {},
    create: {
      enrollmentNo: 'ENR-2025-001',
      firstName: 'Abizer Kasim',
      lastName: 'Kachwala',
      dateOfBirth: new Date('2015-01-01'),
      standard: 'V',
      division: 'A',
      parentName: 'Kasim Kachwala',
      contactNumber: '555-0104',
    },
  });

  // Setup Fees
  await prisma.paymentTransaction.deleteMany({});
  await prisma.studentFee.deleteMany({});
  await prisma.feeCategory.deleteMany({});
  await prisma.academicYear.deleteMany({});

  const targetYear = await prisma.academicYear.create({
    data: { name: "2025-26", isCurrent: true }
  });

  const tuition = await prisma.feeCategory.create({
    data: { name: "Tuition Fees", amount: 4500.00, academicYearId: targetYear.id, standard: "V" }
  });
  const admission = await prisma.feeCategory.create({
    data: { name: "Admission Fees", amount: 6400.00, academicYearId: targetYear.id, standard: "V" }
  });
  const cocurricular = await prisma.feeCategory.create({
    data: { name: "Co-Curricular Fees", amount: 1100.00, academicYearId: targetYear.id, standard: null }
  });

  // Link to Abizer
  const sf1 = await prisma.studentFee.create({
    data: { studentId: studentAbizer.id, feeCategoryId: tuition.id, amountDue: 4500.00, amountPaid: 4500.00, status: "PAID", studentStandard: "V", studentDivision: "A" }
  });
  const sf2 = await prisma.studentFee.create({
    data: { studentId: studentAbizer.id, feeCategoryId: admission.id, amountDue: 6400.00, amountPaid: 6400.00, status: "PAID", studentStandard: "V", studentDivision: "A" }
  });
  const sf3 = await prisma.studentFee.create({
    data: { studentId: studentAbizer.id, feeCategoryId: cocurricular.id, amountDue: 1100.00, amountPaid: 600.00, status: "PARTIAL", studentStandard: "V", studentDivision: "A" }
  });

  // Mock Transactions corresponding to "Installment I, II, III" matching 11,500 total
  await prisma.paymentTransaction.create({
    data: { studentFeeId: sf1.id, amount: 6000.00, paymentMethod: "BANK_TRANSFER", reference: "Installment I", paymentDate: new Date('2025-06-15') }
  });
  await prisma.paymentTransaction.create({
    data: { studentFeeId: sf2.id, amount: 3000.00, paymentMethod: "CASH", reference: "Installment II", paymentDate: new Date('2025-10-10') }
  });
  await prisma.paymentTransaction.create({
    data: { studentFeeId: sf3.id, amount: 2500.00, paymentMethod: "UPI", reference: "Installment III", paymentDate: new Date('2026-01-05') }
  });

  console.log('Dummy database updated with Fees!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
