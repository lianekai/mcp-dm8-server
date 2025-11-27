# MCP 快速参考手册

## 编辑器支持一览表

| 编辑器 | MCP 支持 | 配置文件 | 推荐度 | 备注 |
|--------|----------|----------|--------|------|
| Cursor | ✅ 原生 | `~/.cursor/mcp.json` | ⭐⭐⭐⭐⭐ | 最佳体验 |
| Windsurf | ✅ 原生 | `~/.codeium/windsurf/mcp_config.json` | ⭐⭐⭐⭐⭐ | 功能完整 |
| Claude Desktop | ✅ 官方 | `~/Library/Application Support/Claude/...` | ⭐⭐⭐⭐⭐ | 官方标准 |
| Trae | ⚠️ 实验性 | 参考文档 | ⭐⭐⭐ | 新编辑器，支持有限 |
| Qoder | ⚠️ 开发中 | 参考文档 | ⭐⭐ | Beta 阶段 |
| Gemini | ❌ 不支持 | - | - | 使用自有协议 |

---

## 一键配置命令

### 安装所有 MCP 服务器

```bash
cd /Users/lianyikai/software/mcp

# DM8
cd mcp-dm8-server && npm install && npm run build && npm install -g . && cd ..

# OpenGauss
cd mcp-opengauss-server && npm install && npm run build && npm install -g . && cd ..

# Apifox (可选，按需安装)
# npm install -g mcp-apifox-server
```

### 验证安装

```bash
mcp-dm8-server --version
mcp-opengauss --version
```

---

## 最小配置示例

### Cursor (推荐)

文件: `~/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "dm8": {
      "command": "mcp-dm8-server",
      "args": ["--host", "172.100.40.204", "--port", "5236", "--username", "SYSDBA", "--password", "Max@123456", "--schema", "ARKSH"],
      "env": {"NODE_OPTIONS": "--openssl-legacy-provider"}
    }
  }
}
```

### Windsurf

文件: `~/.codeium/windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "dm8": {
      "command": "mcp-dm8-server",
      "args": ["--host", "127.0.0.1", "--port", "5236", "--username", "SYSDBA", "--password", "SYSDBA", "--schema", "ARKSH"],
      "env": {"NODE_OPTIONS": "--openssl-legacy-provider"}
    }
  }
}
```

### Claude Desktop (macOS)

文件: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "dm8": {
      "command": "mcp-dm8-server",
      "args": ["--host", "127.0.0.1", "--port", "5236", "--username", "SYSDBA", "--password", "SYSDBA", "--schema", "ARKSH"],
      "env": {"NODE_OPTIONS": "--openssl-legacy-provider"}
    }
  }
}
```

---

## 常见问题速查

### 1. 找不到命令

```bash
# 重新安装
cd /Users/lianyikai/software/mcp/mcp-dm8-server
npm install && npm run build && npm install -g .

# 验证
which mcp-dm8-server
```

### 2. 依赖缺失

```bash
cd /path/to/mcp-server
npm install
npm run build
npm install -g .
```

### 3. 协议握手警告

**症状**: `[error] Client error for command Received a response for an unknown message ID`

**解决**: 这是正常的！不影响功能，可以忽略。

**可选升级**:
```bash
cd /path/to/mcp-server
npm install @modelcontextprotocol/sdk@latest
npm run build
npm install -g .
```

### 4. 数据库连接失败

- 检查主机、端口、用户名、密码
- 验证网络可达性: `telnet 172.100.40.204 5236`
- 确认账户未锁定

### 5. 编辑器看不到 MCP 工具

1. 检查配置文件路径是否正确
2. 验证 JSON 格式（使用 JSON 验证器）
3. 重启编辑器
4. 查看编辑器日志

---

## 测试命令

### 测试 DM8 连接

```bash
cd /Users/lianyikai/software/mcp/mcp-dm8-server
NODE_OPTIONS=--openssl-legacy-provider node -e "
const dmdb = require('dmdb');
(async () => {
  try {
    const conn = await dmdb.getConnection('dm://SYSDBA:Max%40123456@172.100.40.204:5236');
    console.log('✅ 连接成功');
    await conn.close();
  } catch(e) {
    console.error('❌ 连接失败:', e.message);
  }
})();
"
```

### 测试 OpenGauss 连接

```bash
cd /Users/lianyikai/software/mcp/mcp-opengauss-server
node -e "
const { Client } = require('node-opengauss');
(async () => {
  try {
    const client = new Client({host: '127.0.0.1', port: 5432, user: 'arksh', password: 'Max@123456', database: 'arksh_shuifenhe'});
    await client.connect();
    console.log('✅ 连接成功');
    await client.end();
  } catch(e) {
    console.error('❌ 连接失败:', e.message);
  }
})();
"
```

---

## 协议握手说明

### 正常握手流程

```
Client ─┬─> initialize (id=0) ──────────> Server
        │
        └─< initialize response ─────────┘
        │
        ├─> initialized notification ───> Server
        │
        └─< Ready ────────────────────────┘
```

### 常见日志

✅ **正常**:
```
[info] Successfully connected to stdio server
[info] Found 3 tools, 0 prompts, and 0 resources
```

⚠️ **警告（可忽略）**:
```
[error] Client error for command Received a response for an unknown message ID
```

❌ **错误**:
```
[error] Failed to start server
[error] Cannot find package 'yargs'
```

---

## 环境变量配置

### macOS/Linux

添加到 `~/.zshrc` 或 `~/.bashrc`:

```bash
# DM8
export DM8_HOST="172.100.40.204"
export DM8_PORT="5236"
export DM8_USERNAME="SYSDBA"
export DM8_PASSWORD="Max@123456"
export DM8_SCHEMA="ARKSH"

# OpenGauss
export OPENGAUSS_HOST="127.0.0.1"
export OPENGAUSS_PORT="5432"
export OPENGAUSS_USER="arksh"
export OPENGAUSS_PASSWORD="Max@123456"
export OPENGAUSS_DATABASE="arksh_shuifenhe"
export OPENGAUSS_SCHEMA="public"

# Apifox
export APIFOX_ACCESS_TOKEN="your-token"
export APIFOX_PROJECT_ID="your-project-id"
```

然后: `source ~/.zshrc`

---

## 支持的工具

### DM8 MCP Server

- `dm8_list_tables` - 列出所有表
- `dm8_execute_query` - 执行只读 SQL
- `dm8_describe_table` - 查看表结构

### OpenGauss MCP Server

- `opengauss_list_tables` - 列出所有表
- `opengauss_execute_query` - 执行只读 SQL
- `opengauss_describe_table` - 查看表结构

### Apifox MCP Server

- `apifox_export_openapi` - 导出 OpenAPI 文档
- `apifox_import_openapi` - 导入 OpenAPI 文档
- `apifox_search_openapi` - 搜索接口
- `apifox_get_operation_detail` - 获取接口详情

---

## 更新检查

```bash
# 检查 MCP SDK 版本
npm view @modelcontextprotocol/sdk version

# 更新到最新版
cd /path/to/mcp-server
npm install @modelcontextprotocol/sdk@latest
npm run build
npm install -g .
```

---

## 联系方式

- 📖 完整文档: [MCP_UNIVERSAL_SETUP_GUIDE.md](./MCP_UNIVERSAL_SETUP_GUIDE.md)
- 🌐 MCP 官方: https://modelcontextprotocol.io
- 💬 社区讨论: GitHub Issues

