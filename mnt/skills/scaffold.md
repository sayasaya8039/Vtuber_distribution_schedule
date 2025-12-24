# /scaffold スキル

新しいプロジェクトの足場を作成します。

## 対応するプロジェクトタイプ

### Webアプリ

```bash
/scaffold web my-app           # Vite + React + TypeScript
/scaffold web my-app --vue     # Vite + Vue + TypeScript
/scaffold web my-app --svelte  # Vite + Svelte + TypeScript
```

**生成内容:**
- プロジェクト構成
- TypeScript設定
- ESLint + Prettier
- Tailwind CSS
- 基本的なページ/コンポーネント

### Hono + Cloudflare Workers

```bash
/scaffold hono my-app          # Hono + TypeScript
```

**生成内容:**
- Honoプロジェクト
- Cloudflare Workers設定
- CORS・Loggerミドルウェア
- 基本的なルート

### Chrome拡張機能

```bash
/scaffold extension my-extension
```

**生成内容:**
- manifest.json
- TypeScript設定
- React + Vite設定
- バックグラウンドスクリプト
- コンテンツスクリプト
- ポップアップUI
- アイコン生成スクリプト

### Electronアプリ

```bash
/scaffold electron my-app
```

**生成内容:**
- Electron Forgeプロジェクト
- TypeScript設定
- メインプロセス・プリロード
- レンダラープロセス
- IPC通信テンプレート

### Pythonアプリ

```bash
/scaffold python my-app        # 一般的なPythonアプリ
/scaffold python my-app --gui  # デスクトップGUIアプリ
```

**生成内容:**
- pyproject.toml
- 仮想環境設定
- ソースディレクトリ構造
- テスト設定（pytest）
- lint設定（ruff, black）

## 実行内容

1. **プロジェクト作成**
   - 適切なテンプレートで初期化
   - 依存関係のインストール

2. **基本設定**
   - ESLint/Prettier設定
   - TypeScript設定
   - Git初期化（.gitignore）

3. **初期ファイル作成**
   - 基本的なコンポーネント/ページ
   - README.md
   - 環境変数テンプレート

4. **開発環境起動**
   - 最初のビルド/起動

## オプション

```bash
/scaffold <type> <name> [options]

# 共通オプション
--template <name>     # テンプレート指定
--no-git              # Git初期化をスキップ
--no-install          # 依存関係インストールをスキップ
--dir <path>          # 作成先ディレクトリ指定

# Webアプリ
--tailwind            # Tailwind CSSを追加
--router              # ルーターを追加

# Chrome拡張
--react               # Reactを使用
--vue                 # Vueを使用
```

## 使用例

```bash
# React Webアプリ
/scaffold web my-dashboard --tailwind --router

# Hono API
/scaffold hono my-api

# Chrome拡張（React）
/scaffold extension my-extension --react

# Electronアプリ
/scaffold electron my-desktop-app

# Python CLIツール
/scaffold python my-cli --cli
```

## 注意事項

- プロジェクト名は小文字の英数字とハイフンのみ
- 既存のディレクトリと重複する場合はエラー
- 作成後はプロジェクトルートで開発開始
