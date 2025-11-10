import { describe, expect, it, vi } from 'vitest';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerDescribeTableTool } from '../src/tools/describeTable.js';
import { registerExecuteQueryTool } from '../src/tools/executeQuery.js';
import { registerListTablesTool } from '../src/tools/listTables.js';

function setupServerMock() {
  const registerTool = vi.fn();
  const server = { registerTool } as unknown as McpServer;
  return { server, registerToolMock: registerTool };
}

function assertRawShape(config: unknown) {
  const schema = config as { inputSchema?: Record<string, unknown> };
  expect(schema?.inputSchema).toBeTruthy();
  expect(typeof (schema?.inputSchema as { safeParse?: unknown }).safeParse).toBe('undefined');
  const fields = Object.values(schema.inputSchema ?? {});
  expect(fields.length).toBeGreaterThan(0);
  for (const field of fields) {
    expect(typeof (field as { safeParse?: unknown }).safeParse).toBe('function');
  }
}

describe('工具注册 inputSchema', () => {
  it('registerListTablesTool 传入原始 Zod shape', () => {
    const { server, registerToolMock } = setupServerMock();
    registerListTablesTool(server);
    const [, config] = registerToolMock.mock.calls[0];
    assertRawShape(config);
  });

  it('registerExecuteQueryTool 传入原始 Zod shape', () => {
    const { server, registerToolMock } = setupServerMock();
    registerExecuteQueryTool(server);
    const [, config] = registerToolMock.mock.calls[0];
    assertRawShape(config);
  });

  it('registerDescribeTableTool 传入原始 Zod shape', () => {
    const { server, registerToolMock } = setupServerMock();
    registerDescribeTableTool(server);
    const [, config] = registerToolMock.mock.calls[0];
    assertRawShape(config);
  });
});

describe('McpServer 集成', () => {
  it('注册后可以解析参数', async () => {
    const { McpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js');
    const server = new McpServer({ name: 'test', version: '1.0.0' });

    registerListTablesTool(server);
    const toolRegistry = (server as unknown as { _registeredTools: Record<string, { inputSchema?: { parse: (value: unknown) => unknown } }> })
      ._registeredTools;
    const listTables = toolRegistry['list_tables'];
    expect(listTables).toBeDefined();
    expect(listTables.inputSchema).toBeDefined();
    const parsed = listTables.inputSchema?.parse({ schema: 'sysdba' });
    expect(parsed).toEqual({ schema: 'sysdba' });
  });
});
