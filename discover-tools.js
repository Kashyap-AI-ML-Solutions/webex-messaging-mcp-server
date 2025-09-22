#!/usr/bin/env node

/**
 * Webex MCP Server Tool Discovery Utility
 * 
 * This utility provides comprehensive tool discovery and analysis capabilities
 * for the Webex Messaging MCP Server following MCP 2025-06-18 best practices.
 * 
 * Features:
 * - Dynamic tool discovery from tools/ directory
 * - Tool validation and structure verification
 * - Category-based organization and filtering
 * - Duplicate detection and conflict resolution
 * - Environment-based tool filtering
 * - JSON and human-readable output formats
 * - Integration with tools-manifest.json
 */

import { readFileSync } from 'fs';
import { discoverTools } from './lib/tools.js';

// ANSI color codes for enhanced output
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

/**
 * Load and parse the tools manifest
 */
function loadToolsManifest() {
  try {
    const manifestContent = readFileSync('./tools-manifest.json', 'utf8');
    return JSON.parse(manifestContent);
  } catch (error) {
    console.warn(`${colors.yellow}Warning: Could not load tools-manifest.json: ${error.message}${colors.reset}`);
    return null;
  }
}

/**
 * Validate tool structure for MCP 2025-06-18 compliance
 */
function validateTool(tool) {
  const issues = [];
  
  if (!tool.definition?.function) {
    issues.push('Missing function definition');
  }
  
  if (!tool.definition?.function?.name) {
    issues.push('Missing function name');
  }
  
  if (!tool.definition?.function?.description) {
    issues.push('Missing function description');
  }
  
  const params = tool.definition?.function?.parameters;
  if (!params) {
    issues.push('Missing parameters object');
  } else {
    if (params.type !== 'object') {
      issues.push(`Parameters type should be 'object', got '${params.type}'`);
    }
    
    if (!params.properties) {
      issues.push('Missing properties object');
    }
    
    if (!Array.isArray(params.required)) {
      issues.push('Required should be an array');
    }
  }
  
  if (typeof tool.function !== 'function') {
    issues.push('Missing or invalid function implementation');
  }
  
  return issues;
}

/**
 * Detect duplicate tool names
 */
function detectDuplicates(tools) {
  const nameMap = new Map();
  const duplicates = [];
  
  tools.forEach(tool => {
    const name = tool.definition?.function?.name;
    if (name) {
      if (nameMap.has(name)) {
        duplicates.push({
          name,
          paths: [nameMap.get(name), tool.path]
        });
      } else {
        nameMap.set(name, tool.path);
      }
    }
  });
  
  return duplicates;
}

/**
 * Categorize tools based on manifest or heuristics
 */
function categorizeTools(tools, manifest) {
  const categories = {};
  
  if (manifest?.categories) {
    // Use manifest categories
    Object.entries(manifest.categories).forEach(([categoryName, categoryInfo]) => {
      categories[categoryName] = {
        description: categoryInfo.description,
        tools: [],
        expected_count: categoryInfo.count
      };
    });
    
    tools.forEach(tool => {
      const toolName = tool.definition?.function?.name;
      let categorized = false;
      
      Object.entries(manifest.categories).forEach(([categoryName, categoryInfo]) => {
        if (categoryInfo.tools.includes(toolName)) {
          categories[categoryName].tools.push(tool);
          categorized = true;
        }
      });
      
      if (!categorized) {
        if (!categories.uncategorized) {
          categories.uncategorized = {
            description: 'Tools not found in manifest categories',
            tools: [],
            expected_count: 0
          };
        }
        categories.uncategorized.tools.push(tool);
      }
    });
  } else {
    // Fallback heuristic categorization
    categories.all = {
      description: 'All discovered tools',
      tools: tools,
      expected_count: tools.length
    };
  }
  
  return categories;
}

/**
 * Filter tools based on ENABLED_TOOLS environment variable
 */
function filterTools(tools) {
  const enabledTools = process.env.ENABLED_TOOLS;
  if (!enabledTools) {
    return tools;
  }
  
  const enabledList = enabledTools.split(',').map(t => t.trim());
  return tools.filter(tool => {
    const toolName = tool.definition?.function?.name;
    return enabledList.includes(toolName);
  });
}

/**
 * Generate detailed tool analysis report
 */
async function generateReport(format = 'human') {
  console.log(`${colors.bright}${colors.blue}🔍 Webex MCP Server Tool Discovery${colors.reset}\n`);
  
  try {
    // Load tools and manifest
    const allTools = await discoverTools();
    const manifest = loadToolsManifest();
    const filteredTools = filterTools(allTools);
    
    // Perform analysis
    const duplicates = detectDuplicates(allTools);
    const categories = categorizeTools(filteredTools, manifest);
    
    // Validation
    const validationResults = filteredTools.map(tool => ({
      name: tool.definition?.function?.name || 'unknown',
      path: tool.path,
      issues: validateTool(tool)
    }));
    
    const validTools = validationResults.filter(r => r.issues.length === 0);
    const invalidTools = validationResults.filter(r => r.issues.length > 0);
    
    if (format === 'json') {
      // JSON output for programmatic use
      const report = {
        summary: {
          total_discovered: allTools.length,
          total_enabled: filteredTools.length,
          valid_tools: validTools.length,
          invalid_tools: invalidTools.length,
          duplicates: duplicates.length,
          categories: Object.keys(categories).length
        },
        tools: filteredTools.map(tool => ({
          name: tool.definition?.function?.name,
          description: tool.definition?.function?.description,
          path: tool.path,
          parameters: Object.keys(tool.definition?.function?.parameters?.properties || {}),
          required_parameters: tool.definition?.function?.parameters?.required || []
        })),
        categories,
        validation: validationResults,
        duplicates,
        manifest_info: manifest ? {
          name: manifest.name,
          version: manifest.version,
          protocol: manifest.protocol,
          sdk_version: manifest.sdk_version
        } : null
      };
      
      console.log(JSON.stringify(report, null, 2));
      return;
    }
    
    // Human-readable output
    console.log(`${colors.bright}📊 Discovery Summary${colors.reset}`);
    console.log(`Total tools discovered: ${colors.green}${allTools.length}${colors.reset}`);
    console.log(`Tools enabled: ${colors.green}${filteredTools.length}${colors.reset}`);
    console.log(`Valid tools: ${colors.green}${validTools.length}${colors.reset}`);
    if (invalidTools.length > 0) {
      console.log(`Invalid tools: ${colors.red}${invalidTools.length}${colors.reset}`);
    }
    if (duplicates.length > 0) {
      console.log(`Duplicate names: ${colors.red}${duplicates.length}${colors.reset}`);
    }
    
    // Environment filtering info
    if (process.env.ENABLED_TOOLS) {
      console.log(`\n${colors.yellow}🔧 Tool filtering active via ENABLED_TOOLS${colors.reset}`);
      console.log(`Enabled tools: ${process.env.ENABLED_TOOLS}`);
    }
    
    // Categories
    console.log(`\n${colors.bright}📂 Tool Categories${colors.reset}`);
    Object.entries(categories).forEach(([categoryName, categoryInfo]) => {
      const status = manifest && categoryInfo.expected_count !== undefined 
        ? (categoryInfo.tools.length === categoryInfo.expected_count ? colors.green : colors.yellow)
        : colors.cyan;
      
      console.log(`\n${colors.bright}${categoryName.toUpperCase()}${colors.reset} ${status}(${categoryInfo.tools.length} tools)${colors.reset}`);
      console.log(`  ${categoryInfo.description}`);
      
      categoryInfo.tools.forEach(tool => {
        const toolName = tool.definition?.function?.name || 'unknown';
        const validation = validationResults.find(v => v.name === toolName);
        const statusIcon = validation?.issues.length === 0 ? '✅' : '❌';
        console.log(`  ${statusIcon} ${toolName}`);
      });
    });
    
    // Validation issues
    if (invalidTools.length > 0) {
      console.log(`\n${colors.bright}${colors.red}❌ Validation Issues${colors.reset}`);
      invalidTools.forEach(tool => {
        console.log(`\n${colors.red}${tool.name}${colors.reset} (${tool.path})`);
        tool.issues.forEach(issue => {
          console.log(`  • ${issue}`);
        });
      });
    }
    
    // Duplicates
    if (duplicates.length > 0) {
      console.log(`\n${colors.bright}${colors.red}🚨 Duplicate Tool Names${colors.reset}`);
      duplicates.forEach(dup => {
        console.log(`\n${colors.red}${dup.name}${colors.reset}`);
        dup.paths.forEach(path => {
          console.log(`  • ${path}`);
        });
      });
    }
    
    // Manifest validation
    if (manifest) {
      console.log(`\n${colors.bright}📋 Manifest Validation${colors.reset}`);
      console.log(`Protocol: ${colors.green}${manifest.protocol}${colors.reset}`);
      console.log(`SDK Version: ${colors.green}${manifest.sdk_version}${colors.reset}`);
      console.log(`Expected total tools: ${colors.green}${manifest.total_tools}${colors.reset}`);
      
      if (allTools.length !== manifest.total_tools) {
        console.log(`${colors.yellow}⚠️  Tool count mismatch: discovered ${allTools.length}, expected ${manifest.total_tools}${colors.reset}`);
      }
    }
    
    console.log(`\n${colors.bright}${colors.green}✅ Tool discovery complete${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Discovery failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// CLI interface
const args = process.argv.slice(2);
const format = args.includes('--json') ? 'json' : 'human';

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
${colors.bright}Webex MCP Server Tool Discovery${colors.reset}

Usage: node discover-tools.js [options]

Options:
  --json          Output in JSON format for programmatic use
  --help, -h      Show this help message

Environment Variables:
  ENABLED_TOOLS   Comma-separated list of tools to enable (filters output)

Examples:
  node discover-tools.js                    # Human-readable report
  node discover-tools.js --json             # JSON output
  ENABLED_TOOLS=create_message,list_rooms node discover-tools.js
  `);
  process.exit(0);
}

// Run the discovery
generateReport(format).catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
