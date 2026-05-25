import fs from 'fs';
import path from 'path';

function walkDir(dir: string, callback: (path: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.next') {
        walkDir(dirPath, callback);
      }
    } else {
      if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx') || dirPath.endsWith('.mjs') || dirPath.endsWith('.js')) {
        callback(dirPath);
      }
    }
  });
}

function replaceInFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Replace references
  content = content.replace(/parentName/g, 'fatherName');
  content = content.replace(/contactNumber/g, 'mobileNumber');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

console.log('Starting replace...');
walkDir(path.join(process.cwd(), 'src'), replaceInFile);
walkDir(path.join(process.cwd(), 'prisma'), replaceInFile);
console.log('Done.');
