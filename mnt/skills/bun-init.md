# /bun-init スキル

Bunを使用してプロジェクトを初期化します。

## 実行内容

1. **プロジェクト種類の選択**
   - 空のプロジェクト
   - Vite（React/Vue/Svelte）
   - Hono（API/Webアプリ）
   - その他テンプレート

2. **初期化実行**

3. **依存関係インストール**

---

## 基本コマンド

### bun init

空のBunプロジェクトを作成

```bash
bun init
```

対話形式で以下を設定：
- パッケージ名
- エントリーポイント

生成されるファイル：
- `package.json`
- `tsconfig.json`（TypeScript設定）
- `index.ts`（エントリーポイント）
- `.gitignore`

---

## テンプレートからの作成

### bun create

テンプレートからプロジェクトを作成（bunx相当）

```bash
bun create <template> <project-name>
```

---

### Viteプロジェクト

```bash
# 対話形式
bun create vite my-app

# テンプレート指定
bun create vite my-app --template react-ts
bun create vite my-app --template vue-ts
bun create vite my-app --template svelte-ts
```

**利用可能なViteテンプレート:**
- `vanilla` / `vanilla-ts`
- `react` / `react-ts` / `react-swc` / `react-swc-ts`
- `vue` / `vue-ts`
- `svelte` / `svelte-ts`
- `preact` / `preact-ts`
- `solid` / `solid-ts`

```bash
# 例：React + TypeScript
bun create vite my-react-app --template react-ts
cd my-react-app
bun install
bun run dev
```

---

### Honoプロジェクト

```bash
bun create hono@latest my-api
```

対話形式でテンプレートを選択：
- `cloudflare-workers`（推奨）
- `cloudflare-pages`
- `bun`
- `deno`
- `nodejs`

```bash
# 例：Cloudflare Workers
bun create hono@latest my-api
# → cloudflare-workers を選択
cd my-api
bun install
bun run dev
```

---

### Next.jsプロジェクト

```bash
bunx create-next-app@latest my-next-app
cd my-next-app
bun install
bun run dev
```

---

### Electronプロジェクト

**注意:** ElectronはBun非対応のためNode.jsを使用

```bash
npx create-electron-app my-electron-app --template=webpack-typescript
cd my-electron-app
npm install
npm start
```

---

## プロジェクト構成例

### Vite + React + TypeScript

```
my-app/
├── public/
│   └── vite.svg
├── src/
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### Hono + Cloudflare Workers

```
my-api/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
└── wrangler.toml
```

---

## 初期化後の操作

### 依存関係インストール

```bash
bun install
```

### 開発サーバー起動

```bash
bun run dev
```

### ビルド

```bash
bun run build
```

---

## カスタムテンプレート

### GitHubから

```bash
bun create github-user/repo my-project
bunx degit github-user/repo my-project
```

### ローカルから

```bash
bun create ./path/to/template my-project
```

---

## 推奨プロジェクト構成

### Webアプリ（フロントエンド）

```bash
bun create vite my-web-app --template react-ts
cd my-web-app
bun install
bun add react-router-dom
bun add -d @types/react-router-dom
```

### APIサーバー

```bash
bun create hono@latest my-api
# → cloudflare-workers
cd my-api
bun install
bun add zod
bun add -d @cloudflare/workers-types
```

### フルスタック（モノレポ）

```bash
mkdir my-fullstack && cd my-fullstack
bun init

mkdir -p packages/web packages/api

# フロントエンド
cd packages/web
bun create vite . --template react-ts

# バックエンド
cd ../api
bun create hono@latest .
```

---

## 使用例

```bash
# React + TypeScriptアプリ
bun create vite my-app --template react-ts && cd my-app && bun install && bun run dev

# Hono API（Cloudflare Workers）
bun create hono@latest my-api && cd my-api && bun install && bun run dev

# 空プロジェクト
bun init && bun add typescript && bunx tsc --init
```
