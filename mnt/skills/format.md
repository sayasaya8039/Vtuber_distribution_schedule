# /format スキル

コードを一貫したスタイルにフォーマットします。

## 対応するフォーマッター

### TypeScript/JavaScript

| ツール | 拡張子 | 推奨度 |
|--------|--------|--------|
| **Prettier** | .ts, .tsx, .js, .jsx, .json | ✅ 推奨 |
| **ESLint** | .ts, .tsx, .js, .jsx | ✅ |
| **Biome** | .ts, .tsx, .js, .jsx, .json | ⚡ 高速 |

### Python

| ツール | 拡張子 | 推奨度 |
|--------|--------|--------|
| **Black** | .py | ✅ 推奨 |
| **Ruff** | .py | ⚡ 高速 |
| **autopep8** | .py | ✅ |

### その他

| 拡張子 | ツール |
|--------|--------|
| .html, .css | Prettier |
| .md, .yml, .toml | Prettier |
| .sh | shfmt |

## 実行内容

1. **フォーマット実行**
   - すべてのコードファイルをフォーマット
   - 設定ファイルに従って整形

2. **Lint修正**
   - 自動修正可能なLintエラーを修正

3. **検証**
   - フォーマット後の差分を表示
   - 問題がなければ完了

## オプション

```bash
/format                  # 全てのファイルをフォーマット
/format --src            # src/ ディレクトリのみ
/format --check          # フォーマットチェックのみ（修正しない）
/format --lint           # Lintも同時に実行
/format --staged         # ステージされたファイルのみ
/format --fix            # 自動修正可能なエラーを修正
```

## 設定ファイル

### Prettier (.prettierrc)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always"
}
```

### ESLint (.eslintrc)

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react/react-in-jsx-scope": "off"
  }
}
```

### Black (pyproject.toml)

```toml
[tool.black]
line-length = 100
target-version = ['py312']
include = '\.pyi?$'
```

### Ruff (pyproject.toml)

```toml
[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "W", "I"]
```

## コマンド例

### TypeScript/JavaScript

```bash
# Prettier
bunx prettier --write "**/*.{ts,tsx,js,jsx,json,md}"
bunx prettier --check .  # チェックのみ

# ESLint
bunx eslint --fix .      # 自動修正付き
bunx eslint .            # チェックのみ

# Biome（高速）
bunx @biomejs/biome check --write .
```

### Python

```bash
# Black
black .                  # フォーマット
black --check .          # チェックのみ

# Ruff（高速）
ruff check --fix .       # Lint + 修正
ruff format .            # フォーマット

# autopep8
autopep8 --in-place --recursive .
```

## Gitフック（自動フォーマット）

### Husky + lint-staged

```bash
# インストール
bun add -d husky lint-staged
bunx husky init

# .husky/pre-commit
bunx lint-staged
```

### package.json

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ],
    "*.py": [
      "ruff check --fix",
      "ruff format"
    ]
  }
}
```

## エディタ設定

### VSCode (.vscode/settings.json)

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.formatOnSave": true
  }
}
```

## フォーマットルール

### 基本ルール

- インデント: 2スペース
- 1行の最大文字数: 100文字
- 文字列: ダブルクォート
- セミコロン: あり（TypeScript/JavaScript）
- 末尾のカンマ: あり（ES5）

### 命名規則

| 種類 | 規則 | 例 |
|------|------|-----|
| クラス | PascalCase | `UserService` |
| 関数・変数 | camelCase | `getUserData` |
| 定数 | UPPER_SNAKE_CASE | `MAX_ITEMS` |
| プライベート | _接頭辞 | `_internalValue` |

## 注意事項

- フォーマット前に必ずコミットを推奨
- Gitフックで自動フォーマットを推奨
- チームで同じ設定を使用すること
- フォーマット結果を確認してからコミット
