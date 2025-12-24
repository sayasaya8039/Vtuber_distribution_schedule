# /check スキル

コードの品質チェック（lint + 型チェック）を実行します。

## 実行内容

1. **リンター実行**
   - ESLint (TypeScript/JavaScript)
   - ruff (Python)
   - clippy (Rust)

2. **型チェック実行**
   - tsc --noEmit (TypeScript)
   - mypy/pyright (Python)

3. **結果レポート**
   - エラー/警告の数
   - 修正提案

## プロジェクト別コマンド

| プロジェクト | リンター | 型チェック |
|-------------|---------|-----------|
| TypeScript | `bunx eslint .` | `bunx tsc --noEmit` |
| Python | `ruff check .` | `mypy .` |
| Rust | `cargo clippy` | - |

## オプション

```bash
/check                   # lint + 型チェック
/check --fix             # 自動修正
/check --lint            # lintのみ
/check --type            # 型チェックのみ
```

## エラー時

1. エラー内容を分析
2. 自動修正可能なものは修正
3. 手動修正が必要なものはリストアップ
