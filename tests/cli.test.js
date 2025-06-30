import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import { promisify } from 'node:util';

describe('CLI Interface', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Set test environment variables
    process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY = 'test-token-123';
    process.env.WEBEX_API_BASE_URL = 'https://webexapis.com/v1';
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('tools command', () => {
    it('should list all available tools', async () => {
      const result = await runCLICommand(['tools']);
      
      assert.strictEqual(result.exitCode, 0, 'Command should exit successfully');
      assert.ok(result.stdout.length > 0, 'Should produce output');
      
      // Should contain tool information
      assert.ok(result.stdout.includes('create_message'), 'Should list create_message tool');
      assert.ok(result.stdout.includes('list_messages'), 'Should list list_messages tool');
      assert.ok(result.stdout.includes('Description:'), 'Should include tool descriptions');
    });

    it('should group tools by workspace', async () => {
      const result = await runCLICommand(['tools']);
      
      assert.strictEqual(result.exitCode, 0);
      assert.ok(result.stdout.includes('webex-messaging'), 'Should show workspace grouping');
    });

    it('should show tool counts', async () => {
      const result = await runCLICommand(['tools']);

      assert.strictEqual(result.exitCode, 0);

      // Should show tools (count is implicit in the number of tools listed)
      const lines = result.stdout.split('\n');
      const toolLines = lines.filter(line =>
        line.includes('Name:') || line.includes('Description:')
      );
      assert.ok(toolLines.length > 10, 'Should display multiple tools');
    });
  });

  describe('help command', () => {
    it('should show help when no command provided', async () => {
      const result = await runCLICommand([]);
      
      // Should show help (exit code might be 0 or 1 depending on implementation)
      assert.ok(result.stdout.includes('Usage') || result.stderr.includes('Usage'), 
        'Should show usage information');
    });

    it('should show help with --help flag', async () => {
      const result = await runCLICommand(['--help']);
      
      assert.ok(result.stdout.includes('Usage') || result.stdout.includes('Commands'), 
        'Should show help information');
    });
  });

  describe('error handling', () => {
    it('should handle invalid commands gracefully', async () => {
      const result = await runCLICommand(['invalid-command']);
      
      // Should exit with error code
      assert.notStrictEqual(result.exitCode, 0, 'Should exit with error for invalid command');
      assert.ok(result.stderr.length > 0 || result.stdout.includes('error'), 
        'Should show error message');
    });

    it('should handle missing environment variables', async () => {
      delete process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY;
      
      const result = await runCLICommand(['tools']);
      
      // Should still work but might show warnings
      // The exact behavior depends on implementation
      assert.ok(result.stdout.length > 0 || result.stderr.length > 0, 
        'Should produce some output');
    });
  });

  describe('output format', () => {
    it('should produce machine-readable output', async () => {
      const result = await runCLICommand(['tools']);
      
      assert.strictEqual(result.exitCode, 0);
      
      // Output should be structured
      const lines = result.stdout.split('\n').filter(line => line.trim());
      assert.ok(lines.length > 10, 'Should have substantial output');
      
      // Should contain tool names and descriptions
      const hasToolInfo = lines.some(line => 
        line.includes('Name:') || line.includes('Description:')
      );
      assert.ok(hasToolInfo, 'Should contain structured tool information');
    });

    it('should handle unicode and special characters', async () => {
      const result = await runCLICommand(['tools']);
      
      assert.strictEqual(result.exitCode, 0);
      
      // Should not have encoding issues
      assert.ok(!result.stdout.includes('�'), 'Should not have encoding issues');
    });
  });
});

// Helper function to run CLI commands
async function runCLICommand(args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn('node', ['index.js', ...args], {
      cwd: process.cwd(),
      env: { ...process.env, ...options.env },
      stdio: ['pipe', 'pipe', 'pipe']
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
      resolve({
        exitCode,
        stdout,
        stderr
      });
    });

    // Set a timeout to prevent hanging
    setTimeout(() => {
      child.kill('SIGTERM');
      resolve({
        exitCode: -1,
        stdout,
        stderr: stderr + '\nTimeout: Command killed after 10 seconds'
      });
    }, 10000);
  });
}
