const { readdirSync, readFileSync, statSync } = require('node:fs');
const path = require('node:path');
const babel = require('@babel/core');

const ROOT = process.cwd();
const INCLUDED_ROOTS = ['components', 'server', 'test', 'scripts'];
const EXTENSIONS = new Set(['.js', '.jsx']);
const IGNORED_DIRECTORIES = new Set(['node_modules', 'build', '.git']);

function collectFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory)) {
    if (IGNORED_DIRECTORIES.has(entry)) continue;
    const fullPath = path.join(directory, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else if (EXTENSIONS.has(path.extname(entry))) {
      files.push(fullPath);
    }
  }
  return files;
}

let failed = false;
for (const rootName of INCLUDED_ROOTS) {
  const rootPath = path.join(ROOT, rootName);
  for (const filePath of collectFiles(rootPath)) {
    const source = readFileSync(filePath, 'utf8');
    try {
      babel.parseSync(source, {
        filename: filePath,
        sourceType: 'unambiguous',
        parserOpts: {
          plugins: ['jsx'],
        },
      });
    } catch (error) {
      failed = true;
      console.error(`${path.relative(ROOT, filePath)}: ${error.message}`);
    }
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log('Lint passed: all JavaScript and JSX files parsed successfully.');
}
