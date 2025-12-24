# /init スキル

新しいプロジェクトを素早く初期化します。

## 対応するプロジェクトタイプ

| タイプ | コマンド | 説明 |
|--------|----------|------|
| **Webアプリ（React）** | `/init web-react` | Vite + React + TypeScript |
| **Webアプリ（Vue）** | `/init web-vue` | Vite + Vue + TypeScript |
| **Hono API** | `/init hono` | Hono + Cloudflare Workers |
| **Chrome拡張** | `/init extension` | Chrome拡張機能 |
| **Electron** | `/init electron` | Electron デスクトップアプリ |
| **Python** | `/init python` | Python プロジェクト |

## 実行内容

1. **プロジェクト作成**
   - 適切なテンプレートを選択
   - プロジェクト名を入力

2. **初期設定**
   - TypeScript/Python設定
   - ESLint/Prettier/Ruff設定
   - Git初期化

3. **基本ファイル作成**
   - README.md
   - .gitignore
   - 環境変数テンプレート

4. **開発環境準備**
   - 依存関係インストール
   - 最初のビルド確認

## オプション

```bash
/init <type> [options]

# 共通オプション
--name <name>         # プロジェクト名
--dir <path>          # 作成先ディレクトリ
--no-git              # Git初期化をスキップ
--no-install          # 依存関係インストールをスキップ
--template <name>     # テンプレート指定

# Webアプリ
--tailwind            # Tailwind CSSを追加
--router              # ルーターを追加
--state               # 状態管理ライブラリを追加

# API
--auth                # 認証機能を追加
--db <type>           # データベース（prisma, drizzle）

# Chrome拡張
--react               # Reactを使用
--popup               # ポップアップUIを追加
--options             # オプションページを追加
```

## 使用例

```bash
# React Webアプリ（基本）
/init web-react --name my-dashboard

# React Webアプリ（フル機能）
/init web-react --name my-app --tailwind --router --state

# Vue Webアプリ
/init web-vue --name my-vue-app

# Hono API
/init hono --name my-api --auth --db prisma

# Chrome拡張（React）
/init extension --name my-extension --react --popup --options

# Electronアプリ
/init electron --name my-desktop-app

# Pythonアプリ
/init python --name my-python-tool
```

## 生成される構造

### Webアプリ（React）

```
my-app/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── vite-env.d.ts
│   └── assets/
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .eslintrc.json
├── .prettierrc
├── .gitignore
└── README.md
```

### Hono API

```
my-api/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
├── wrangler.toml
├── .gitignore
└── README.md
```

### Chrome拡張

```
my-extension/
├── src/
│   ├── background/
│   ├── content/
│   ├── popup/
│   └── options/
├── public/
│   └── icons/
├── manifest.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
└── README.md
```

### Python

```
my-python-tool/
├── src/
│   └── my_tool/
│       ├── __init__.py
│       └── main.py
├── tests/
│   └── test_main.py
├── pyproject.toml
├── .gitignore
└── README.md
```

## 作成後の手順

```bash
# 1. プロジェクトへ移動
cd my-app

# 2. 開発サーバー起動
bun run dev    # TypeScript/JavaScript
python -m src  # Python

# 3. ブラウザで確認
# http://localhost:5173
```

## テンプレートのカスタマイズ

プロジェクト固有のテンプレートを使用する場合：

```bash
# カスタムテンプレート指定
/init web-react --template ./templates/custom-react

# テンプレートの場所
# ~/.config/claude/templates/
# またはプロジェクト内の ./templates/
```

## プロジェクト名のルール

- 小文字の英数字とハイフンのみ
- 先頭は英字のみ
- 3〜50文字
- 例: `my-app`, `dashboard-2025`

## 注意事項

- 既存のディレクトリと重複する場合はエラー
- プロジェクト名は慎重に選択（後から変更は困難）
- 作成後はREADME.mdに従って開発を開始
- Gitリモートを追加してバックアップを推奨
