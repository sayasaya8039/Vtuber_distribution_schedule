---
paths: "**/mcp-server/**, **/mcp/**, **/*-mcp/**"
---

# MCP サーバー開発ルール

## 概要

MCP（Model Context Protocol）サーバーは、AIアシスタントに外部ツールやリソースへのアクセスを提供するサーバーです。

---

## プロジェクトセットアップ

### 初期化（Bunを使用）

```bash
mkdir my-mcp-server
cd my-mcp-server
bun init
bun add @modelcontextprotocol/sdk zod
bun add -d @types/node typescript
```

### package.json

```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "my-mcp-server": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "bun run src/index.ts",
    "start": "node dist/index.js"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

---

## 基本構造

### src/index.ts

```typescript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

const server = new Server(
  {
    name: 'my-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

// ツール一覧
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'greet',
        description: '挨拶メッセージを生成します',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: '挨拶する相手の名前',
            },
          },
          required: ['name'],
        },
      },
    ],
  }
})

// ツール実行
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  if (name === 'greet') {
    const userName = args?.name as string
    return {
      content: [
        {
          type: 'text',
          text: `こんにちは、${userName}さん！`,
        },
      ],
    }
  }

  throw new Error(`不明なツール: ${name}`)
})

// サーバー起動
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('MCPサーバーが起動しました')
}

main().catch(console.error)
```

---

## ツール定義

### 入力スキーマ（Zod使用推奨）

```typescript
import { z } from 'zod'

const SearchInputSchema = z.object({
  query: z.string().describe('検索クエリ'),
  limit: z.number().min(1).max(100).default(10).describe('取得件数'),
  includeMetadata: z.boolean().default(false).describe('メタデータを含めるか'),
})

type SearchInput = z.infer<typeof SearchInputSchema>

// ツール定義
{
  name: 'search',
  description: 'データを検索します',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: '検索クエリ' },
      limit: { type: 'number', description: '取得件数', default: 10 },
      includeMetadata: { type: 'boolean', description: 'メタデータを含めるか', default: false },
    },
    required: ['query'],
  },
}
```

---

## リソース提供

### リソースサーバー

```typescript
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

const server = new Server(
  { name: 'resource-server', version: '1.0.0' },
  { capabilities: { resources: {} } }
)

// リソース一覧
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'file:///config.json',
        name: '設定ファイル',
        description: 'アプリケーション設定',
        mimeType: 'application/json',
      },
    ],
  }
})

// リソース読み込み
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params

  if (uri === 'file:///config.json') {
    const config = { theme: 'dark', language: 'ja' }
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(config, null, 2),
        },
      ],
    }
  }

  throw new Error(`不明なリソース: ${uri}`)
})
```

---

## Claude Desktop設定

### claude_desktop_config.json

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args": ["C:/path/to/my-mcp-server/dist/index.js"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

### 設定ファイルの場所

- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

---

## エラーハンドリング

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params

    // 入力バリデーション
    const parsed = SearchInputSchema.safeParse(args)
    if (!parsed.success) {
      return {
        content: [
          {
            type: 'text',
            text: `入力エラー: ${parsed.error.message}`,
          },
        ],
        isError: true,
      }
    }

    // 処理実行
    const result = await search(parsed.data)
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `エラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    }
  }
})
```

---

## ビルド・配布

### ビルド

```bash
bun run build
```

### npm公開（オプション）

```bash
npm publish
```

### ローカルインストール

```bash
npm install -g .
```

---

## ベストプラクティス

| 項目 | 推奨 |
|------|------|
| 入力検証 | Zodでスキーマ定義・バリデーション |
| エラーメッセージ | 日本語で分かりやすく |
| ログ出力 | `console.error` を使用（stdoutはMCP通信用） |
| 非同期処理 | async/awaitで適切にハンドリング |
| 型安全 | TypeScript必須 |

---

## 禁止事項

- `console.log` の使用（stdoutはMCP通信用）
- エラーの握りつぶし
- 無限ループ・ブロッキング処理
- 機密情報のハードコード
