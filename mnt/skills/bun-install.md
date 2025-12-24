# /bun-install スキル

Bunパッケージマネージャーを使用した依存関係管理を行います。

## 実行内容

1. **現在の状態確認**
   - `package.json` の存在確認
   - 既存の依存関係確認

2. **適切なコマンド選択**
   - インストール / 追加 / 削除 / 更新

3. **実行・結果確認**

---

## コマンド一覧

### bun install

プロジェクトの全依存関係をインストール（npm installの25倍高速）

```bash
bun install
```

**オプション:**

| オプション | 説明 |
|-----------|------|
| `--production` | devDependencies を除外 |
| `--frozen-lockfile` | ロックファイルと完全一致を強制（CI推奨） |
| `--dry-run` | 実行せずに確認のみ |
| `--force` | キャッシュを無視して再インストール |
| `--no-save` | package.json を更新しない |

```bash
# CI環境での推奨
bun install --frozen-lockfile

# 本番環境用
bun install --production
```

---

### bun add

パッケージを追加インストール

```bash
# 基本
bun add react

# バージョン指定
bun add react@18.2.0
bun add react@latest

# 複数パッケージ
bun add react react-dom
```

**オプション:**

| オプション | 説明 |
|-----------|------|
| `-d, --dev` | devDependencies に追加 |
| `--optional` | optionalDependencies に追加 |
| `-g, --global` | グローバルインストール |
| `--exact` | 完全一致バージョン（^なし） |

```bash
# 開発依存
bun add -d typescript @types/node

# グローバル
bun add -g bun

# 完全一致バージョン
bun add --exact react@18.2.0
```

---

### bun remove

パッケージを削除

```bash
bun remove lodash
bun remove react react-dom  # 複数
```

---

### bun update

パッケージを更新

```bash
# 全パッケージ更新
bun update

# 特定パッケージ更新
bun update react

# 最新バージョンに更新
bun update --latest
```

---

### bun ci

CI環境用の厳密なインストール

```bash
bun ci
```

- `bun.lock` と完全一致を要求
- 不一致の場合はエラー終了

---

## モノレポ対応

### --filter オプション

特定のワークスペースのみ処理

```bash
# パターンマッチ
bun install --filter 'packages/*'

# 特定パッケージ
bun add react --filter @myorg/web
```

---

## ロックファイル

- Bunは `bun.lockb`（バイナリ）を生成
- `bun.lock`（テキスト）も利用可能

```bash
# テキスト形式に変換
bun install --save-text-lockfile
```

---

## トラブルシューティング

| 問題 | 解決策 |
|------|--------|
| キャッシュ破損 | `bun install --force` |
| ロックファイル競合 | `rm bun.lockb && bun install` |
| 権限エラー（グローバル） | 管理者権限で実行 |

---

## 使用例

```bash
# 新規プロジェクトセットアップ
bun init
bun add react react-dom
bun add -d typescript @types/react

# 既存プロジェクトのクローン後
bun install

# CI/CDパイプライン
bun ci
bun run build
bun test
```
