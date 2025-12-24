# /clean スキル

不要なコード・依存関係・ファイルをクリーンアップします。

## クリーンアップ内容

### 依存関係

| 項目 | チェック内容 | クリーンアップ |
|------|-------------|---------------|
| **未使用パッケージ** | `bun pm ls` | `bun remove` |
| **古いパッケージ** | `bun outdated` | `bun update` |
| **重複依存** | lockファイル | 再インストール |
| **壊れた依存** | インストールエラー | キャッシュ削除 |

### コード

| 項目 | チェック内容 | クリーンアップ |
|------|-------------|---------------|
| **未使用インポート** | ESLint | 自動削除 |
| **未使用変数** | ESLint | 自動削除 |
| **デッドコード** | カバレッジ | 削除提案 |
| **重複コード** | コード解析 | 共通化 |
| **console.log** | grep | 削除提案 |

### ファイル

| 項目 | チェック内容 | クリーンアップ |
|------|-------------|---------------|
| **未使用ファイル** | インポート未参照 | 削除提案 |
| **ビルド成果物** | dist/, build/ | .gitignore確認 |
| **キャッシュ** | キャッシュディレクトリ | 削除 |
| **一時ファイル** | .tmp, .bak | 削除 |

## 実行内容

1. **スキャン**
   - 依存関係チェック
   - 未使用コード検出
   - 不要ファイル検索

2. **レポート**
   - 削除可能な項目をリストアップ
   - サイズ・影響を表示

3. **クリーンアップ**
   - 安全な項目を自動削除
   - 確認が必要な項目を提案

## オプション

```bash
/clean                   # 全てのクリーンアップを実行
/clean --deps            # 依存関係のみ
/clean --code            # コードのみ
/clean --files           # ファイルのみ
/clean --dry-run         # 削除せずに確認のみ
/clean --aggressive      # 安全でないものも含めて削除
```

## コマンド例

### 依存関係

```bash
# 未使用パッケージ検出
bunx depcheck

# 古いパッケージ確認
bun outdated

# 安全な更新
bun update

# キャッシュ削除
bun pm cache rm
rm -rf node_modules bun.lockb
bun install
```

### コード

```bash
# 未使用インポート削除（ESLint）
bunx eslint --fix .

# 未使用インポート削除（専用ツール）
bunx ts-unused-exports tsconfig.json

# デッドコード検出
bunx knip

# 重複コード検出
bunx jscpd .
```

### ファイル

```bash
# 未使用ファイル検出
find src -name "*.ts" -o -name "*.tsx"
# インポート未参照を確認

# キャッシュ削除
rm -rf .next
rm -rf node_modules/.cache
rm -rf .eslintcache

# 一時ファイル削除
find . -name "*.tmp" -delete
find . -name "*.bak" -delete
find . -name ".DS_Store" -delete
```

## クリーンアップ前チェック

```bash
# 1. 現在の状態をコミット
git add .
git commit -m "[chore] クリーンアップ前の状態"

# 2. ブランチを作成（オプション）
git checkout -b chore/cleanup

# 3. クリーンアップ実行
/clean

# 4. 動作確認
bun test
bun run build

# 5. 問題なければコミット
git add .
git commit -m "[chore] 不要コード・依存関係を削除"
```

## 安全なクリーンアップ

以下は安全に削除できます：

✅ **削除しても安全**
- node_modules/
- dist/, build/, .next/
- *.log
- .eslintcache
- *.tmp, *.bak
- .DS_Store, Thumbs.db
- 未使用のインポート（ESLint検出）
- console.log（本番環境）

⚠️ **確認が必要**
- 未使用の関数・変数（エクスポートされているか確認）
- 未使用のファイル（他からインポートされていないか確認）
- パッケージ（依存関係を確認）

❌ **削除禁止**
- envファイル（.env.local 等）
- Git履歴
- システムファイル

## 注意事項

- クリーンアップ前に必ずコミットすること
- `--dry-run` でまず確認を推奨
- パッケージ削除後は動作確認必須
- 誤削除した場合は `git checkout` で復元
