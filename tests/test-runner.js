#!/usr/bin/env node

/**
 * Test runner for Webex MCP Server
 * Provides colored output and test summaries
 */

import { spawn } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

async function runTests(pattern = '**/*.test.js', options = {}) {
  console.log(colorize('🧪 Webex MCP Server Test Suite', 'cyan'));
  console.log(colorize('=' .repeat(50), 'blue'));
  console.log();

  const startTime = Date.now();
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  try {
    // Find test files
    const testFiles = await findTestFiles(pattern);
    
    if (testFiles.length === 0) {
      console.log(colorize('⚠️  No test files found matching pattern:', 'yellow'), pattern);
      return;
    }

    console.log(colorize(`📁 Found ${testFiles.length} test files:`, 'blue'));
    testFiles.forEach(file => {
      console.log(colorize(`   • ${file}`, 'cyan'));
    });
    console.log();

    // Run tests
    for (const testFile of testFiles) {
      const result = await runTestFile(testFile, options);
      totalTests += result.total;
      passedTests += result.passed;
      failedTests += result.failed;
    }

    // Print summary
    const duration = Date.now() - startTime;
    console.log();
    console.log(colorize('📊 Test Summary', 'bright'));
    console.log(colorize('-'.repeat(30), 'blue'));
    console.log(`${colorize('Total:', 'bright')} ${totalTests}`);
    console.log(`${colorize('Passed:', 'green')} ${passedTests}`);
    console.log(`${colorize('Failed:', 'red')} ${failedTests}`);
    console.log(`${colorize('Duration:', 'bright')} ${duration}ms`);
    
    if (failedTests === 0) {
      console.log();
      console.log(colorize('✅ All tests passed!', 'green'));
    } else {
      console.log();
      console.log(colorize(`❌ ${failedTests} test(s) failed`, 'red'));
      process.exit(1);
    }

  } catch (error) {
    console.error(colorize('💥 Test runner error:', 'red'), error.message);
    process.exit(1);
  }
}

async function findTestFiles(pattern) {
  const testDir = join(process.cwd(), 'tests');
  const files = await readdir(testDir);
  return files.filter(file => file.endsWith('.test.js'));
}

async function runTestFile(testFile, options = {}) {
  const testPath = join(process.cwd(), 'tests', testFile);
  
  console.log(colorize(`🔍 Running ${testFile}...`, 'yellow'));
  
  return new Promise((resolve) => {
    const args = ['--test', testPath];
    if (options.verbose) {
      args.push('--test-reporter=spec');
    }

    const child = spawn('node', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        // Ensure test environment variables
        WEBEX_PUBLIC_WORKSPACE_API_KEY: process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY || 'test-token-123',
        WEBEX_API_BASE_URL: process.env.WEBEX_API_BASE_URL || 'https://webexapis.com/v1'
      }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (exitCode) => {
      const result = parseTestOutput(stdout, stderr, exitCode);
      
      if (result.passed > 0) {
        console.log(colorize(`   ✅ ${result.passed} passed`, 'green'));
      }
      if (result.failed > 0) {
        console.log(colorize(`   ❌ ${result.failed} failed`, 'red'));
        if (options.verbose && stderr) {
          console.log(colorize('   Error details:', 'red'));
          console.log(stderr.split('\n').map(line => `     ${line}`).join('\n'));
        }
      }
      if (result.skipped > 0) {
        console.log(colorize(`   ⏭️  ${result.skipped} skipped`, 'yellow'));
      }

      resolve(result);
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      child.kill('SIGTERM');
      console.log(colorize(`   ⏰ ${testFile} timed out`, 'red'));
      resolve({ total: 0, passed: 0, failed: 1, skipped: 0 });
    }, 30000);
  });
}

function parseTestOutput(stdout, stderr, exitCode) {
  // Parse Node.js test runner output
  const lines = stdout.split('\n');
  
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  // Look for test result patterns
  lines.forEach(line => {
    if (line.includes('✓') || line.includes('ok')) {
      passed++;
    } else if (line.includes('✗') || line.includes('not ok')) {
      failed++;
    } else if (line.includes('# SKIP')) {
      skipped++;
    }
  });

  // If we can't parse the output, use exit code
  if (passed === 0 && failed === 0) {
    if (exitCode === 0) {
      passed = 1; // Assume at least one test passed
    } else {
      failed = 1; // Assume at least one test failed
    }
  }

  return {
    total: passed + failed + skipped,
    passed,
    failed,
    skipped
  };
}

// CLI interface
const args = process.argv.slice(2);
const options = {
  verbose: args.includes('--verbose') || args.includes('-v'),
  coverage: args.includes('--coverage') || args.includes('-c')
};

const pattern = args.find(arg => !arg.startsWith('-')) || '**/*.test.js';

// Run tests
runTests(pattern, options).catch(error => {
  console.error(colorize('💥 Unexpected error:', 'red'), error);
  process.exit(1);
});
