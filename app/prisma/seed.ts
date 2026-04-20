import { PrismaClient } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient();

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
  })
  
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
  })

  await prisma.student.upsert({
    where: { enrollmentNo: 'ENR-2023-003' },
    update: {},
    create: {
      enrollmentNo: 'ENR-2023-003',
      firstName: 'Rahul',
      lastName: 'Sharma',
      dateOfBirth: new Date('2005-11-05'),
      standard: '10',
      division: 'A',
      parentName: 'Rajesh Sharma',
      contactNumber: '555-0103',
    },
  })

  console.log('Dummy database populated!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
