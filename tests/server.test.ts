import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  connect: vi.fn().mockResolvedValue(undefined),
  registerTool: vi.fn(),
  transport: vi.fn(),
}));

vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => {
  return {
    McpServer: vi.fn().mockImplementation(() => ({
      connect: mocks.connect,
      registerTool: mocks.registerTool,
    })),
  };
});

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => {
  return {
    StdioServerTransport: vi.fn().mockImplementation(() => {
      mocks.transport();
      return {};
    }),
  };
});

describe('startServer', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    mocks.connect.mockClear();
    mocks.registerTool.mockClear();
    mocks.transport.mockClear();
    process.env = { ...originalEnv };
    delete process.env.DM_USERNAME;
    delete process.env.DM_PASSWORD;
    delete process.env.DM_HOST;
    delete process.env.DM_SCHEMA;
  });

  it('允许在缺少数据库配置时仍然完成握手', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { startServer } = await import('../src/server.js');

    await expect(startServer()).resolves.toBeUndefined();

    expect(mocks.transport).toHaveBeenCalledTimes(1);
    expect(mocks.connect).toHaveBeenCalledTimes(1);
    expect(mocks.registerTool).toHaveBeenCalledTimes(3);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('缺少数据库配置'));

    warnSpy.mockRestore();
  });

  it('在配置完整时不会输出警告', async () => {
    process.env.DM_USERNAME = 'user';
    process.env.DM_PASSWORD = 'pass';
    process.env.DM_HOST = 'localhost';
    process.env.DM_SCHEMA = 'public';

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { startServer } = await import('../src/server.js');

    await expect(startServer()).resolves.toBeUndefined();

    expect(warnSpy).not.toHaveBeenCalled();
    expect(mocks.registerTool).toHaveBeenCalledTimes(3);

    warnSpy.mockRestore();
  });
});
