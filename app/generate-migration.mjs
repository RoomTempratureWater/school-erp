import { execSync } from 'child_process';
import fs from 'fs';

const diffOutput = execSync('npx prisma migrate diff --from-schema prisma/schema.old.prisma --to-schema prisma/schema.prisma --script').toString();

fs.mkdirSync('prisma/migrations/20260526000000_add_detailed_student_fields', { recursive: true });
fs.writeFileSync('prisma/migrations/20260526000000_add_detailed_student_fields/migration.sql', diffOutput, 'utf8');
console.log('Migration generated successfully');
