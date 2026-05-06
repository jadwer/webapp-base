#!/usr/bin/env node

/**
 * Module Export Validator
 *
 * Validates that barrel file (index.ts) exports match the actual exports
 * in source files. Prevents "no exported member" TypeScript errors.
 *
 * Usage: node scripts/validate-module-exports.js <module-name>
 * Example: node scripts/validate-module-exports.js auth
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

/**
 * Parses an index.ts file and extracts all export statements
 */
function parseBarrelFile(content) {
  const exports = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip comments and empty lines
    if (line.startsWith('//') || line.startsWith('/*') || !line) continue;

    // Match: export { default as Name } from './path'
    const defaultAsMatch = line.match(/export\s*{\s*default\s+as\s+(\w+)\s*}\s*from\s*['"](.+)['"]/);
    if (defaultAsMatch) {
      exports.push({
        name: defaultAsMatch[1],
        path: defaultAsMatch[2],
        type: 'default-as',
        line: i + 1,
        raw: line
      });
      continue;
    }

    // Match: export { Name } from './path'
    const namedMatch = line.match(/export\s*{\s*(\w+)\s*}\s*from\s*['"](.+)['"]/);
    if (namedMatch) {
      exports.push({
        name: namedMatch[1],
        path: namedMatch[2],
        type: 'named',
        line: i + 1,
        raw: line
      });
      continue;
    }

    // Match: export type { Name } from './path'
    const typeMatch = line.match(/export\s+type\s*{\s*(\w+)\s*}\s*from\s*['"](.+)['"]/);
    if (typeMatch) {
      exports.push({
        name: typeMatch[1],
        path: typeMatch[2],
        type: 'type',
        line: i + 1,
        raw: line
      });
      continue;
    }

    // Match: export * from './path'
    const starMatch = line.match(/export\s*\*\s*from\s*['"](.+)['"]/);
    if (starMatch) {
      exports.push({
        name: '*',
        path: starMatch[1],
        type: 'star',
        line: i + 1,
        raw: line
      });
      continue;
    }
  }

  return exports;
}

/**
 * Checks if a source file has a default export
 */
function hasDefaultExport(content, exportName) {
  // Match: export default function Name() {}
  if (content.match(new RegExp(`export\\s+default\\s+function\\s+${exportName}\\s*\\(`))) {
    return true;
  }

  // Match: export default class Name {}
  if (content.match(new RegExp(`export\\s+default\\s+class\\s+${exportName}\\s*{`))) {
    return true;
  }

  // Match: export default Name (at end of file)
  if (content.match(new RegExp(`export\\s+default\\s+${exportName}\\s*;?\\s*$`, 'm'))) {
    return true;
  }

  // Match: const Name = ...; export default Name
  const hasConstDeclaration = content.match(new RegExp(`(const|let|var)\\s+${exportName}\\s*=`));
  const hasDefaultExportOfName = content.match(new RegExp(`export\\s+default\\s+${exportName}`));
  if (hasConstDeclaration && hasDefaultExportOfName) {
    return true;
  }

  return false;
}

/**
 * Checks if a source file has a named export
 */
function hasNamedExport(content, exportName) {
  // Match: export function Name() {}
  if (content.match(new RegExp(`export\\s+function\\s+${exportName}\\s*\\(`))) {
    return true;
  }

  // Match: export const Name = ...
  if (content.match(new RegExp(`export\\s+const\\s+${exportName}\\s*=`))) {
    return true;
  }

  // Match: export class Name {}
  if (content.match(new RegExp(`export\\s+class\\s+${exportName}\\s*{`))) {
    return true;
  }

  // Match: export { Name }
  if (content.match(new RegExp(`export\\s*{[^}]*\\b${exportName}\\b[^}]*}`))) {
    return true;
  }

  return false;
}

/**
 * Checks if a source file has a type/interface export
 */
function hasTypeExport(content, exportName) {
  // Match: export type Name = ...
  if (content.match(new RegExp(`export\\s+type\\s+${exportName}\\s*=`))) {
    return true;
  }

  // Match: export interface Name {}
  if (content.match(new RegExp(`export\\s+interface\\s+${exportName}\\s*{`))) {
    return true;
  }

  // Match: export { Name } where Name is a type
  if (content.match(new RegExp(`export\\s+type\\s*{[^}]*\\b${exportName}\\b[^}]*}`))) {
    return true;
  }

  return false;
}

/**
 * Validates a single export statement
 */
function validateExport(exportStatement, modulePath, moduleDir) {
  // Resolve the source file path
  let sourceFilePath = path.join(moduleDir, exportStatement.path);

  // Try with different extensions if file doesn't exist
  const extensions = ['.ts', '.tsx', '.js', '.jsx', ''];
  let sourcePath = null;

  for (const ext of extensions) {
    const testPath = sourceFilePath + ext;
    if (fs.existsSync(testPath)) {
      sourcePath = testPath;
      break;
    }
  }

  if (!sourcePath) {
    return {
      valid: false,
      error: `Source file not found: ${exportStatement.path}`,
      suggestion: 'Check that the file path is correct'
    };
  }

  // Skip validation for star exports
  if (exportStatement.type === 'star') {
    return {
      valid: true,
      message: 'Star export (re-exports all)'
    };
  }

  // Read source file
  const sourceContent = fs.readFileSync(sourcePath, 'utf-8');

  // Validate based on export type
  switch (exportStatement.type) {
    case 'default-as':
      // Should have default export
      if (!hasDefaultExport(sourceContent, exportStatement.name)) {
        return {
          valid: false,
          error: `Expected default export but found named export`,
          suggestion: `Change to: export { ${exportStatement.name} } from '${exportStatement.path}'`,
          sourcePath
        };
      }
      break;

    case 'named':
      // Should have named export
      if (hasDefaultExport(sourceContent, exportStatement.name)) {
        return {
          valid: false,
          error: `Expected named export but found default export`,
          suggestion: `Change to: export { default as ${exportStatement.name} } from '${exportStatement.path}'`,
          sourcePath
        };
      }
      if (!hasNamedExport(sourceContent, exportStatement.name)) {
        return {
          valid: false,
          error: `Named export '${exportStatement.name}' not found in source file`,
          suggestion: 'Check the export name or remove this export',
          sourcePath
        };
      }
      break;

    case 'type':
      // Should have type/interface export
      if (!hasTypeExport(sourceContent, exportStatement.name) &&
          !hasNamedExport(sourceContent, exportStatement.name)) {
        return {
          valid: false,
          error: `Type/interface '${exportStatement.name}' not found in source file`,
          suggestion: 'Check the type name or remove this export',
          sourcePath
        };
      }
      break;
  }

  return {
    valid: true,
    sourcePath
  };
}

/**
 * Main validation function
 */
function validateModule(moduleName) {
  console.log(`${colors.bold}${colors.cyan}Validating module: ${moduleName}${colors.reset}\n`);

  const moduleDir = path.join(__dirname, '..', 'src', 'modules', moduleName);
  const indexPath = path.join(moduleDir, 'index.ts');

  // Check if module exists
  if (!fs.existsSync(moduleDir)) {
    console.error(`${colors.red}✗ Module not found: ${moduleDir}${colors.reset}`);
    process.exit(1);
  }

  // Check if index.ts exists
  if (!fs.existsSync(indexPath)) {
    console.error(`${colors.red}✗ index.ts not found: ${indexPath}${colors.reset}`);
    process.exit(1);
  }

  // Read and parse index.ts
  const indexContent = fs.readFileSync(indexPath, 'utf-8');
  const exports = parseBarrelFile(indexContent);

  if (exports.length === 0) {
    console.log(`${colors.yellow}⚠ No exports found in index.ts${colors.reset}`);
    process.exit(0);
  }

  console.log(`Found ${exports.length} export(s) to validate\n`);

  // Validate each export
  let errors = 0;
  let warnings = 0;

  for (const exportStatement of exports) {
    const result = validateExport(exportStatement, moduleName, moduleDir);

    if (result.valid) {
      console.log(`${colors.green}✓${colors.reset} ${exportStatement.name} (${exportStatement.type})`);
      if (result.sourcePath) {
        console.log(`  ${colors.cyan}→ ${path.relative(process.cwd(), result.sourcePath)}${colors.reset}`);
      }
    } else {
      errors++;
      console.log(`${colors.red}✗${colors.reset} ${exportStatement.name} (line ${exportStatement.line})`);
      console.log(`  ${colors.red}Error: ${result.error}${colors.reset}`);
      if (result.suggestion) {
        console.log(`  ${colors.yellow}Suggestion: ${result.suggestion}${colors.reset}`);
      }
      if (result.sourcePath) {
        console.log(`  ${colors.cyan}Source: ${path.relative(process.cwd(), result.sourcePath)}${colors.reset}`);
      }
      console.log(`  ${colors.yellow}Raw: ${exportStatement.raw}${colors.reset}`);
    }
    console.log();
  }

  // Summary
  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  Total exports: ${exports.length}`);
  console.log(`  Valid: ${colors.green}${exports.length - errors}${colors.reset}`);
  if (errors > 0) {
    console.log(`  Errors: ${colors.red}${errors}${colors.reset}`);
  }

  if (errors > 0) {
    console.log(`\n${colors.red}${colors.bold}✗ Validation failed${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}${colors.bold}✓ Validation passed${colors.reset}`);
    process.exit(0);
  }
}

// Main execution
const moduleName = process.argv[2];

if (!moduleName) {
  console.error('Usage: node scripts/validate-module-exports.js <module-name>');
  console.error('Example: node scripts/validate-module-exports.js auth');
  process.exit(1);
}

validateModule(moduleName);
