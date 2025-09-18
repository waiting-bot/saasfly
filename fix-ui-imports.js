#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript/TSX files in the apps/nextjs directory (excluding .next)
function getTsFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip .next directory and other non-source directories
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...getTsFiles(fullPath));
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Fix imports in a single file
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Pattern to match imports from @saasfly/ui/subpath
  const importPattern = /from\s+["']@saasfly\/ui\/([^"']+)["']/g;
  
  content = content.replace(importPattern, (match, subpath) => {
    modified = true;
    return 'from "@saasfly/ui"';
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed imports in: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main function
function main() {
  const nextjsDir = path.join(process.cwd(), 'apps/nextjs');
  const files = getTsFiles(nextjsDir);
  
  console.log(`Found ${files.length} TypeScript files to check...`);
  
  let fixedCount = 0;
  for (const file of files) {
    if (fixImportsInFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\nFixed imports in ${fixedCount} files.`);
  
  if (fixedCount > 0) {
    console.log('All imports have been updated to use @saasfly/ui instead of specific subpaths.');
  }
}

main();