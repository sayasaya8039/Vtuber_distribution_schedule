# /bun スキル

Bunのオールインワン機能を活用した開発支援スキルです。

## 概要

Bunは JavaScript/TypeScript 向けの高速オールインワンツールキットです。
- **ランタイム**: Node.jsの25倍高速なスタートアップ
- **パッケージマネージャー**: npm の25倍高速
- **バンドラー**: esbuildより高速
- **テストランナー**: Jest互換

## サブスキル

| コマンド | 説明 |
|----------|------|
| `/bun-install` | パッケージ管理（install, add, remove） |
| `/bun-run` | スクリプト・ファイル実行 |
| `/bun-test` | テスト実行 |
| `/bun-build` | バンドル・コンパイル |
| `/bun-init` | プロジェクト初期化 |

## クイックリファレンス

### パッケージ管理

```bash
# 依存関係インストール
bun install

# パッケージ追加
bun add react
bun add -d typescript    # 開発依存
bun add -g bun           # グローバル

# パッケージ削除
bun remove lodash

# 更新
bun update
```

### スクリプト実行

```bash
# package.json スクリプト
bun run dev
bun run build

# ファイル直接実行
bun index.ts
bun --watch index.ts     # ウォッチモード

# パッケージ実行（npx相当）
bunx create-vite my-app
```

### テスト

```bash
# テスト実行
bun test

# ウォッチモード
bun test --watch

# カバレッジ
bun test --coverage
```

### バンドル

```bash
# バンドル
bun build ./src/index.ts --outdir ./dist

# 単一実行ファイル生成
bun build ./src/index.ts --compile --outfile myapp
```

### プロジェクト作成

```bash
# 新規プロジェクト
bun init

# Viteプロジェクト
bun create vite my-app

# Honoプロジェクト
bun create hono@latest my-api
```

## Node.js/npm との対応表

| npm/Node.js | Bun |
|-------------|-----|
| `npm install` | `bun install` |
| `npm install <pkg>` | `bun add <pkg>` |
| `npm install -D <pkg>` | `bun add -d <pkg>` |
| `npm uninstall <pkg>` | `bun remove <pkg>` |
| `npm run <script>` | `bun run <script>` |
| `npx <pkg>` | `bunx <pkg>` |
| `node index.js` | `bun index.js` |
| `npm test` | `bun test` |

## Bunを使うべき場面

| 場面 | 推奨 |
|------|------|
| TypeScript/React/Vite開発 | Bun |
| Next.js開発 | Bun |
| Hono/Cloudflare Workers | Bun |
| テスト実行 | Bun |
| Electron開発 | Node.js（Bun非対応） |

## 参考リンク

- [Bun公式ドキュメント](https://bun.com/docs)
- [GitHub](https://github.com/oven-sh/bun)
- [ブログ](https://bun.com/blog)
