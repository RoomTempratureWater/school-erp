import { PrismaClient } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  await prisma.internalUser.upsert({
    where: { userid: 'admin' },
    update: {},
    create: {
      userid: 'admin',
      password: 'password'
    }
  });

  await prisma.student.upsert({
    where: { grNo: 'ENR-2023-001' },
    update: {},
    create: {
      grNo: 'ENR-2023-001',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('2005-04-12'),
      standard: '10',
      division: 'A',
      fatherName: 'Michael Doe',
      mobileNumber: '555-0101',
    },
  })
  
  await prisma.student.upsert({
    where: { grNo: 'ENR-2023-002' },
    update: {},
    create: {
      grNo: 'ENR-2023-002',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: new Date('2006-08-22'),
      standard: '9',
      division: 'B',
      fatherName: 'Sarah Smith',
      mobileNumber: '555-0102',
    },
  })

  await prisma.student.upsert({
    where: { grNo: 'ENR-2023-003' },
    update: {},
    create: {
      grNo: 'ENR-2023-003',
      firstName: 'Rahul',
      lastName: 'Sharma',
      dateOfBirth: new Date('2005-11-05'),
      standard: '10',
      division: 'A',
      fatherName: 'Rajesh Sharma',
      mobileNumber: '555-0103',
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
