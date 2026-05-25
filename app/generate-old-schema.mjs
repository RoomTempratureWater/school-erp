import fs from 'fs';

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const regexToRemove = /  aadharNo[\s\S]*?stateCode\s+String\?\n/g;
schema = schema.replace(regexToRemove, '');

const datesRegex = /  dateOfAdmission[\s\S]*?dateOfLeaving[^\n]*\n/g;
schema = schema.replace(datesRegex, '');

schema = schema.replace(/  middleName[^\n]*\n/g, '');

const dobRegex = /  dateOfBirth           DateTime\n/g;
schema = schema.replace(dobRegex, '  dateOfBirth           DateTime\n  parentName            String?\n  contactNumber         String?\n  enrollmentNo          String        @unique\n');

schema = schema.replace(/  grNo                  String        @unique\n/g, '');
schema = schema.replace(/  grNo\s+String\n/g, '');
schema = schema.replace(/@@unique\(\[grNo\]\)\n/g, '');
schema = schema.replace(/@@unique\(\[aadharNo\]\)\n/g, '');

fs.writeFileSync('prisma/schema.old.prisma', schema);
console.log('Old schema generated');
