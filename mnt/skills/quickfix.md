# /quickfix スキル

よくあるエラーや問題を自動検出して素早く修正します。

## 対応する問題

### TypeScript/JavaScript

| 問題 | 修正内容 |
|------|----------|
| `Cannot find module` | パッケージをインストール |
| `Property does not exist` | 型定義をインストール |
| `import/no-unresolved` | インポートパススを修正 |
| `unused variable` | 未使用変数を削除 |
| `missing dependency` | 依存関係を追加 |

### Python

| 問題 | 修正内容 |
|------|----------|
| `ModuleNotFoundError` | モジュールをインストール |
| `IndentationError` | インデントを修正 |
| `undefined name` | 未定義変数を修正 |
| `import error` | インポートを修正 |

### Git

| 問題 | 修正内容 |
|------|----------|
| `detached HEAD` | ブランチをチェックアウト |
| `merge conflict` | コンフリクトを解決 |
| `push rejected` | リベースしてプッシュ |

### Bun/npm

| 問題 | 修正内容 |
|------|----------|
| `bun.lockb` 破損 | キャッシュを削除して再インストール |
| `dependency mismatch` | パッケージを更新 |
| `port already in use` | ポートを使用中のプロセスを停止 |

## 実行内容

1. **エラー検出**
   - `bun run lint` または ESLint 実行
   - `bun run typecheck` または TypeScript エラーチェック
   - その他エラーログを解析

2. **自動修正**
   - 可能な場合は自動修正コマンドを実行
   - 修正候補を提示

3. **検証**
   - 修正後に再度チェックを実行

## オプション

```bash
/quickfix                 # 全てのチェックを実行
/quickfix --ts            # TypeScriptのみ
/quickfix --lint          # Lintのみ
/quickfix --git           # Git関連のみ
/quickfix --deps          # 依存関係のみ
/quickfix --auto          # 自動修正可能なもののみ実行
```

## 自動修正コマンド例

```bash
# TypeScript/JavaScript
bunx eslint --fix .                    # ESLint自動修正
bunx prettier --write .                # フォーマット
bun run typecheck                      # 型チェック

# Python
ruff check --fix .                     # Lint自動修正
black .                                # フォーマット
mypy .                                 # 型チェック

# 依存関係
bun install                            # 再インストール
bun update                             # パッケージ更新
```

## 注意事項

- 自動修正前に必ずGitコミットを推奨
- 修正内容を確認してから適用すること
- 複雑な問題は手動修正が必要
