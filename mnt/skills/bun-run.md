# /bun-run スキル

Bunランタイムを使用してスクリプト・ファイルを実行します。

## 実行内容

1. **実行対象の特定**
   - package.json スクリプト
   - TypeScript/JavaScript ファイル

2. **適切なオプション選択**
   - ウォッチモード
   - 環境変数

3. **実行・結果確認**

---

## 基本コマンド

### ファイル実行

```bash
# 基本実行
bun run index.ts
bun index.ts          # run は省略可能

# 複数ファイルタイプ対応
bun app.tsx           # TSX
bun script.jsx        # JSX
bun server.mjs        # ESM
```

**Bunの特徴:**
- TypeScript/TSX をトランスパイルなしで直接実行
- Node.jsより5倍高速なスタートアップ

---

### package.json スクリプト

```bash
# スクリプト実行
bun run dev
bun run build
bun run test

# 利用可能なスクリプト一覧
bun run
```

**ライフサイクルフック:**
- `pre<script>` が存在すれば先に実行
- `post<script>` が存在すれば後に実行

```json
{
  "scripts": {
    "prebuild": "bun run clean",
    "build": "bun build ./src/index.ts --outdir ./dist",
    "postbuild": "echo 'Build complete!'"
  }
}
```

---

## 重要なオプション

### --watch（ウォッチモード）

ファイル変更時に自動再起動

```bash
bun --watch run index.ts
bun --watch index.ts
```

**注意:** `--watch` は `bun` の直後に配置

---

### --bun

Node.js用CLIをBunで強制実行

```bash
# Viteなど、shebangでNode.jsを指定しているパッケージをBunで実行
bun --bun run vite
```

---

### --filter（モノレポ）

複数ワークスペースでスクリプトを並列実行

```bash
# パターンマッチ
bun run --filter 'packages/*' build

# 特定パッケージ
bun run --filter @myorg/web dev
```

---

### --smol

メモリ使用量を削減（GCを頻繁に実行）

```bash
bun --smol run server.ts
```

---

### 標準入力からの実行

```bash
echo "console.log('Hello')" | bun run -
```

---

## 環境変数

### .env ファイル

Bunは自動的に `.env` を読み込み

```bash
# .env
DATABASE_URL=postgres://localhost/mydb
API_KEY=secret123
```

```typescript
// index.ts
console.log(process.env.DATABASE_URL)
```

### 優先順位

1. `.env.local`
2. `.env.{NODE_ENV}`（例: `.env.production`）
3. `.env`

---

## bunx（パッケージ実行）

npx の代替。パッケージをインストールせずに実行

```bash
# Viteプロジェクト作成
bunx create-vite my-app

# TypeScript初期化
bunx tsc --init

# その他
bunx cowsay 'Hello Bun!'
bunx degit user/repo my-project
```

---

## パフォーマンス比較

| 操作 | Node.js | Bun |
|------|---------|-----|
| スタートアップ | 25.1ms | 5.2ms |
| TypeScript実行 | トランスパイル必要 | 直接実行 |

---

## 使用例

```bash
# 開発サーバー起動（ウォッチモード）
bun --watch run src/server.ts

# 本番ビルド
bun run build

# スクリプト一覧確認
bun run

# 一時的なスクリプト実行
bunx ts-node script.ts
```

---

## トラブルシューティング

| 問題 | 解決策 |
|------|--------|
| モジュールが見つからない | `bun install` で依存関係を確認 |
| TypeScriptエラー | `bunx tsc --noEmit` で型チェック |
| 環境変数が読めない | `.env` ファイルの配置・形式を確認 |
