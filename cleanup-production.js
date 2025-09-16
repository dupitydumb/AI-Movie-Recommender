#!/usr/bin/env node

/**
 * Production Cleanup Script
 * Removes console.log statements and other development artifacts
 */

const fs = require('fs');
const path = require('path');

const CONSOLE_PATTERNS = [
  /console\.log\([^)]*\);?\s*\n?/g,
  /console\.warn\([^)]*\);?\s*\n?/g,
  /console\.debug\([^)]*\);?\s*\n?/g,
  // Keep console.error for production error handling
];

const SENSITIVE_PATTERNS = [
  /console\.log\(['"`].*API.*Key.*['"`].*\);?\s*\n?/gi,
  /console\.log\(['"`].*Token.*['"`].*\);?\s*\n?/gi,
  /console\.log\(['"`].*Secret.*['"`].*\);?\s*\n?/gi,
];

function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalLength = content.length;
    let changes = 0;

    // Remove sensitive console logs first
    SENSITIVE_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, '');
        changes += matches.length;
      }
    });

    // Remove general console.log and console.debug (keep console.error)
    content = content.replace(/^(\s*)console\.(log|debug)\([^)]*\);?\s*$/gm, '');
    
    // Remove empty lines that were left behind
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (content.length !== originalLength) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Cleaned: ${filePath} (${changes} console statements removed)`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
  }
  return false;
}

function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .next, .git
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(item)) {
          walk(fullPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

function removeTestFiles() {
  const testFiles = [
    'test-jwt.js',
    'test-api.js',
    'test-search-flow.js',
    'api-test-suite.js',
    'api-tester.html'
  ];
  
  let removed = 0;
  testFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`🗑️  Removed test file: ${file}`);
      removed++;
    }
  });
  
  return removed;
}

function main() {
  console.log('🚀 Starting Production Cleanup...\n');
  
  // Remove test files
  console.log('📁 Removing test files...');
  const removedFiles = removeTestFiles();
  console.log(`   Removed ${removedFiles} test files\n`);
  
  // Clean console statements from source files
  console.log('🧹 Cleaning console statements...');
  const sourceFiles = findFiles('./src');
  let cleanedFiles = 0;
  
  sourceFiles.forEach(file => {
    if (cleanFile(file)) {
      cleanedFiles++;
    }
  });
  
  console.log(`\n✨ Production cleanup complete!`);
  console.log(`   📊 Files processed: ${sourceFiles.length}`);
  console.log(`   🧹 Files cleaned: ${cleanedFiles}`);
  console.log(`   🗑️  Test files removed: ${removedFiles}`);
  
  if (cleanedFiles > 0 || removedFiles > 0) {
    console.log('\n⚠️  Next steps:');
    console.log('   1. Review the changes');
    console.log('   2. Test your application');
    console.log('   3. Commit the cleaned code');
    console.log('   4. Rotate your API keys before deployment');
  }
}

if (require.main === module) {
  main();
}

module.exports = { cleanFile, findFiles, removeTestFiles };
