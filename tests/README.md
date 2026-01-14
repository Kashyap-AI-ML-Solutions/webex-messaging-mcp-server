# Webex MCP Server Test Suite

Comprehensive test coverage for the Webex Messaging MCP Server with 118 passing tests across 53 test suites.

## Test Overview

### 📊 Test Statistics
- **Total Tests**: 118
- **Test Suites**: 53
- **Pass Rate**: 100%
- **Coverage Areas**: 6 major components
- **API Coverage**: 50+ Webex APIs tested
- **Bug Fixes Validated**: 20+ critical fixes with test coverage

## Test Structure

### 🧪 Test Files

#### `webex-config.test.js`
Tests the centralized configuration module that handles Webex API authentication and URL management.

**Coverage:**
- Environment variable handling
- Token formatting (Bearer prefix removal)
- Header generation for API requests
- URL construction
- Configuration validation

**Key Tests:**
- ✅ Base URL configuration (default and custom)
- ✅ Token processing with/without Bearer prefix
- ✅ Header generation for GET and POST requests
- ✅ URL construction with various endpoints
- ✅ Environment validation

#### `tools.test.js`
Tests the tool discovery and loading system that finds and validates all Webex API tools.

**Coverage:**
- Tool discovery from file system
- Tool structure validation
- Function availability verification
- Naming convention compliance

**Key Tests:**
- ✅ Discovers all 52 tools correctly
- ✅ Validates tool structure and metadata
- ✅ Ensures executable functions exist
- ✅ Checks naming conventions (snake_case)
- ✅ Verifies unique tool names
- ✅ Validates comprehensive API coverage

#### `webex-tools.test.js`
Integration tests for specific Webex tool implementations with mocked API calls.

**Coverage:**
- Individual tool functionality
- API request construction
- Parameter handling
- Authentication headers
- Error handling

**Key Tests:**
- ✅ `create_message` tool with room and direct messages
- ✅ `list_messages` tool with query parameters
- ✅ `get_my_own_details` tool endpoint verification
- ✅ Authentication header validation
- ✅ Error handling for API failures

#### `mcp-server.test.js`
Tests MCP server integration and tool registration capabilities with MCP 2025-11-25 protocol.

**Coverage:**
- MCP server creation with McpServer class
- Tool registration format (new registerTool pattern)
- JSON schema validation for Zod compatibility
- Parameter type checking
- Tool categorization
- Protocol version compliance

**Key Tests:**
- ✅ Server metadata configuration (MCP 2025-11-25)
- ✅ Tool availability for registration
- ✅ MCP format compliance with new SDK
- ✅ JSON schema validation (Zod-compatible)
- ✅ Parameter naming and type validation
- ✅ Tool registration without inputSchema in registerTool calls

#### `tool-implementations.test.js`
Detailed tests for specific tool implementations including edge cases and error scenarios.

**Coverage:**
- Message tool implementations
- Room management tools
- Membership and team management tools
- Person management tools
- Error handling patterns
- Authentication flows
- Network failure scenarios
- URL encoding validation
- Parameter validation logic

**Key Tests:**
- ✅ Message creation with various parameters
- ✅ Room creation, listing, and management
- ✅ Membership creation with proper parameter handling
- ✅ Team membership management
- ✅ Direct message listing
- ✅ Person update with avatar field filtering
- ✅ HTTP error handling
- ✅ Network timeout handling
- ✅ Malformed JSON response handling
- ✅ URL encoding for special characters
- ✅ DELETE response handling (204 No Content)

#### `integration.test.js`
End-to-end integration tests that verify the complete system functionality.

**Coverage:**
- Complete tool discovery workflow
- Tool categorization verification
- Configuration integration
- Performance testing
- Concurrent execution

**Key Tests:**
- ✅ End-to-end tool discovery and validation
- ✅ Tool category completeness
- ✅ Configuration flexibility
- ✅ Performance benchmarks
- ✅ Concurrent tool execution

#### `cli.test.js`
Tests the command-line interface functionality.

**Coverage:**
- CLI command execution
- Output formatting
- Error handling
- Help system

**Key Tests:**
- ✅ Tool listing command
- ✅ Help system functionality
- ✅ Error handling for invalid commands
- ✅ Output format validation

## Running Tests

### Basic Test Execution
```bash
# Run all tests
npm test

# Run tests locally (same as npm test)
npm run test:local

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run custom test runner
npm run test:runner

# Validate code quality + tests
npm run validate

# Tool discovery and analysis
npm run discover-tools

# Tool discovery with JSON output
npm run discover-tools -- --json
```

### Test Environment
Tests use a controlled environment with:
- Mock Webex API responses
- Test-specific environment variables
- Isolated configuration state
- Network error simulation
- MCP 2025-11-25 protocol compliance testing
- Zod schema validation testing

### Tool Discovery Testing
The `discover-tools.js` utility provides comprehensive tool analysis:

```bash
# Validate all 52 tools are discovered
npm run discover-tools

# Check tool categorization and manifest compliance
npm run discover-tools -- --json | jq '.summary'

# Test tool filtering
ENABLED_TOOLS=create_message,list_rooms npm run discover-tools
```

**Discovery Features:**
- ✅ **Tool Validation**: Checks MCP 2025-11-25 compliance
- ✅ **Duplicate Detection**: Identifies conflicting tool names
- ✅ **Category Analysis**: Validates tool organization
- ✅ **Manifest Verification**: Compares against `tools-manifest.json`
- ✅ **Environment Filtering**: Tests `ENABLED_TOOLS` functionality

### Test Data
- **Mock API Token**: `test-token-123`
- **Test Base URL**: `https://webexapis.com/v1`
- **Mock Responses**: Configurable per test case

## Test Categories

### 🔧 Unit Tests
- Configuration module functions
- Individual tool implementations
- Utility functions
- Error handling

### 🔗 Integration Tests
- Tool discovery system
- MCP server integration (MCP 2025-11-25)
- API request construction
- Authentication flows
- Transport mode testing (STDIO and HTTP)

### 🎯 End-to-End Tests
- Complete workflow validation
- CLI interface testing
- Performance verification
- Concurrent execution

### 🚨 Error Handling Tests
- Network failures
- API errors (401, 404, 500)
- Malformed responses
- Missing configuration

## Mock Strategy

### API Mocking
Tests use a sophisticated mocking strategy:

```javascript
// Configurable mock responses
global.fetch = async (url, options) => {
  // Capture request details for verification
  capturedUrl = url;
  capturedOptions = options;
  
  // Return controlled response
  return {
    ok: true,
    status: 200,
    json: async () => ({ success: true })
  };
};
```

### Environment Isolation
Each test suite manages its own environment:

```javascript
beforeEach(() => {
  originalEnv = { ...process.env };
  process.env.WEBEX_PUBLIC_WORKSPACE_API_KEY = 'test-token';
});

afterEach(() => {
  process.env = originalEnv;
});
```

## Coverage Areas

### ✅ Fully Covered
- Configuration management
- Tool discovery
- API request construction
- Authentication handling
- Error scenarios
- CLI functionality

### 📈 Metrics
- **Function Coverage**: 100% of exported functions
- **Branch Coverage**: All major code paths
- **Error Coverage**: All error conditions
- **Integration Coverage**: Complete workflows
- **API Coverage**: 50+ Webex APIs tested end-to-end
- **Bug Fix Coverage**: 20+ critical fixes validated
- **Parameter Validation**: Comprehensive edge case testing

## Recent Improvements

### � MCP Protocol Migration (Latest Update)
- **Upgraded MCP SDK**: From 1.9.0 to 1.25.2+ with MCP 2025-11-25 protocol
- **New Transport Support**: Added StreamableHTTP transport alongside STDIO
- **Parameter Passing Fix**: Removed inputSchema from registerTool calls (critical SDK 1.25.2+ fix)
- **Zod Schema Compatibility**: Ensured all 52 tools have proper type: 'object' declarations
- **HTTP Mode Testing**: Added comprehensive HTTP transport testing
- **Session Management**: Implemented proper mcp-session-id header handling
- **CORS Configuration**: Added exposedHeaders for HTTP 406 error resolution

### �🔧 Bug Fixes and Enhancements (Previous Update)
- **Fixed 20+ critical template literal bugs** across API implementations
- **Enhanced parameter validation** for membership and team APIs
- **Improved URL encoding** for all path parameters
- **Added DELETE response handling** for 204 No Content responses
- **Enhanced avatar field validation** in person update APIs
- **Added 34 new test cases** covering all fixes and edge cases

### 🧪 Test Coverage Expansion
- **Membership Tools**: Comprehensive testing for create/update membership APIs
- **Team Management**: Full coverage of team membership operations
- **Direct Messages**: Parameter validation and URL construction testing
- **Person Management**: Avatar field filtering and update validation
- **Error Scenarios**: Enhanced error handling test coverage

## Pre-Commit Hooks

### 🔒 Quality Assurance
The project includes pre-commit hooks using [Husky](https://typicode.github.io/husky/) to ensure code quality:

```bash
# Install pre-commit hooks (done automatically on npm install)
npm run prepare

# Manual validation (same as pre-commit)
npm run validate

# Individual checks
npm run lint    # Syntax and code quality check
npm test        # Run all 118 unit tests
```

### 🚀 Pre-Commit Process
When you commit code, the pre-commit hook automatically:
1. **Syntax Check**: Validates JavaScript syntax using `node -c`
2. **Unit Tests**: Runs all 118 tests across 53 test suites via `npm run test:local`
3. **Quality Gate**: Prevents commit if any validation fails

```bash
🚀 Running pre-commit validation...
🔍 Checking code quality and running 118 unit tests across 53 test suites...
✅ All validations passed! Commit proceeding...
```

### 📋 Setup Instructions
Pre-commit hooks are automatically installed when you run:
```bash
npm install
```

To manually set up or reinstall:
```bash
npm install husky --save-dev
npx husky init
```

## HTTP Mode Testing

### Testing HTTP Transport
The test suite includes comprehensive testing for the new HTTP transport mode:

```bash
# Test HTTP mode functionality
npm run start:http &
SERVER_PID=$!

# Test health endpoint
curl http://localhost:3001/health

# Test MCP initialization
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2025-11-25", "capabilities": {}, "clientInfo": {"name": "test", "version": "1.0.0"}}}'

# Clean up
kill $SERVER_PID
```

### MCP 2025-11-25 Protocol Testing
- **Session Management**: Tests proper `mcp-session-id` header handling
- **CORS Configuration**: Validates `exposedHeaders` configuration
- **StreamableHTTP Transport**: Tests SSE response format
- **Protocol Compliance**: Ensures MCP 2025-11-25 compatibility

## Continuous Integration

Tests are designed to run in CI/CD environments:
- No external dependencies
- Deterministic results
- Fast execution (< 15 seconds)
- Clear failure reporting
- Pre-commit hooks for local quality assurance
- MCP protocol compliance validation

## Contributing

When adding new features:

1. **Add corresponding tests** for new functionality
2. **Update existing tests** if behavior changes
3. **Maintain 100% pass rate** before submitting
4. **Follow naming conventions** for test descriptions
5. **Include error scenarios** in test coverage

### Test Naming Convention
```javascript
describe('Component Name', () => {
  describe('method/feature name', () => {
    it('should describe expected behavior', () => {
      // Test implementation
    });
  });
});
```

## Debugging Tests

### Common Issues
- **Environment variables**: Ensure test environment is isolated
- **Async operations**: Use proper async/await patterns
- **Mock cleanup**: Restore original functions in afterEach
- **Timing issues**: Use deterministic delays in tests

### Debug Commands
```bash
# Run specific test file
node --test tests/webex-config.test.js

# Run with verbose output
node --test --test-reporter=spec tests/*.test.js

# Debug specific test
node --inspect-brk --test tests/specific.test.js
```

This comprehensive test suite ensures the reliability and maintainability of the Webex MCP Server codebase.
