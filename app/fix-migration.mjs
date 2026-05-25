import fs from 'fs';
import { execSync } from 'child_process';

// 1. Remove bad migration
fs.rmSync('prisma/migrations/20260526000000_add_detailed_student_fields', { recursive: true, force: true });

// 2. Reset DB to the clean state (will apply up to 20260511150831_add_fee_audit_triggers)
console.log('Resetting DB...');
execSync('npx prisma migrate reset --force', { stdio: 'inherit' });

// 3. Generate correct diff from the DB to the current schema
console.log('Generating diff...');
const diffSql = execSync('npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script').toString();

// 4. Save to a new migration folder
fs.mkdirSync('prisma/migrations/20260526000000_add_detailed_student_fields', { recursive: true });
fs.writeFileSync('prisma/migrations/20260526000000_add_detailed_student_fields/migration.sql', diffSql, 'utf8');

// 5. Apply the migration
console.log('Deploying migration...');
execSync('npx prisma migrate deploy', { stdio: 'inherit' });

console.log('All fixed!');
