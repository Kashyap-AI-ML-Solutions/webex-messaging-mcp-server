#!/usr/bin/env node

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { discoverTools } from "./lib/tools.js";
import { randomUUID } from "crypto";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const SERVER_NAME = "webex-messaging-mcp-server";

/**
 * Create and configure MCP server with tools
 * Following MCP 2025-06-18 protocol patterns
 */
async function createMcpServer() {
  const server = new McpServer({
    name: SERVER_NAME,
    version: "0.1.0",
  }, {
    capabilities: {
      tools: {},
    },
  });

  server.onerror = (error) => console.error("[MCP Server Error]", error);

  // Discover and register all tools using new pattern
  const tools = await discoverTools();
  console.error(`[MCP Server] Registering ${tools.length} tools`);

  // Register each tool individually (NO inputSchema in registerTool call)
  for (const tool of tools) {
    const definition = tool.definition?.function;
    if (!definition) {
      console.error(`[MCP Server] Skipping tool with invalid definition:`, tool);
      continue;
    }

    try {
      server.registerTool(
        definition.name,
        {
          title: definition.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: definition.description
          // 🚨 CRITICAL: NO inputSchema here - causes keyValidator._parse errors in v1.17.4+
        },
        async (args) => {
          try {
            // args contains the actual parameters passed by the client
            const result = await tool.function(args);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }]
            };
          } catch (error) {
            console.error(`[MCP Server] Tool ${definition.name} error:`, error);
            return {
              content: [{
                type: 'text',
                text: `Error: ${error.message}`
              }],
              isError: true
            };
          }
        }
      );
    } catch (error) {
      console.error(`[MCP Server] Failed to register tool ${definition.name}:`, error);
    }
  }

  return server;
}

async function run() {
  // Transport mode detection following MCP 2025-06-18 patterns
  const args = process.argv.slice(2);
  const modeFromEnv = process.env.MCP_MODE?.toLowerCase();
  const isHTTP = args.includes('--http') || modeFromEnv === 'http';
  const isSSE = args.includes('--sse') || modeFromEnv === 'sse';

  const mode = isHTTP ? 'HTTP' : 'STDIO';
  console.error(`[MCP Server] Mode: ${mode}`);

  // Deprecation warning for SSE
  if (isSSE) {
    console.error('WARNING: SSE mode is deprecated in MCP 2025-06-18. Use StreamableHTTP instead.');
    console.error('Use --http flag or MCP_MODE=http for HTTP mode.');
  }

  if (isHTTP) {
    // HTTP mode with StreamableHTTP transport
    const app = express();
    app.use(express.json());

    // Enable CORS for all origins and expose MCP session header
    app.use(cors({
      origin: '*',
      exposedHeaders: ['mcp-session-id']
    }));

    // Map to store transports by session ID
    const transports = {};

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        mode: 'HTTP',
        protocol: 'MCP 2025-06-18',
        server: SERVER_NAME,
        version: '0.1.0'
      });
    });

    // MCP POST endpoint following official patterns
    app.post('/mcp', async (req, res) => {
      const sessionId = req.headers['mcp-session-id'];

      try {
        let transport;

        if (sessionId && transports[sessionId]) {
          // Reuse existing transport
          transport = transports[sessionId];
        } else if (!sessionId && isInitializeRequest(req.body)) {
          // New initialization request
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (sessionId) => {
              transports[sessionId] = transport;
              console.error(`[HTTP] New session initialized: ${sessionId}`);
            },
            onsessionclosed: (sessionId) => {
              delete transports[sessionId];
              console.error(`[HTTP] Session closed: ${sessionId}`);
            }
          });

          // Clean up transport when closed
          transport.onclose = () => {
            if (transport.sessionId) {
              delete transports[transport.sessionId];
            }
          };

          // Create and connect the server
          const server = await createMcpServer();
          await server.connect(transport);
        } else {
          // Invalid request
          res.status(400).json({
            jsonrpc: '2.0',
            error: { code: -32000, message: 'Bad Request: No valid session ID provided' },
            id: null
          });
          return;
        }

        // Handle the request
        await transport.handleRequest(req, res, req.body);
      } catch (error) {
        console.error('[HTTP] Request handling error:', error);
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: '2.0',
            error: { code: -32603, message: 'Internal server error' },
            id: null
          });
        }
      }
    });

    // Handle GET requests for SSE streams
    app.get('/mcp', async (req, res) => {
      const sessionId = req.headers['mcp-session-id'];
      if (!sessionId || !transports[sessionId]) {
        res.status(400).send('Invalid or missing session ID');
        return;
      }

      const transport = transports[sessionId];
      await transport.handleRequest(req, res);
    });

    // Handle DELETE requests for session termination
    app.delete('/mcp', async (req, res) => {
      const sessionId = req.headers['mcp-session-id'];
      if (!sessionId || !transports[sessionId]) {
        res.status(400).send('Invalid or missing session ID');
        return;
      }

      const transport = transports[sessionId];
      await transport.handleRequest(req, res);
    });

    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.error(`[HTTP Server] running on port ${port}`);
      console.error(`[HTTP Server] Health check: http://localhost:${port}/health`);
      console.error(`[HTTP Server] MCP endpoint: http://localhost:${port}/mcp`);
    });
  } else {
    // STDIO mode: single server instance
    console.error('[MCP Server] Starting in STDIO mode');
    const server = await createMcpServer();

    process.on("SIGINT", async () => {
      console.error('[MCP Server] Shutting down...');
      await server.close();
      process.exit(0);
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('[MCP Server] Connected via STDIO transport');
  }
}

run().catch(console.error);
