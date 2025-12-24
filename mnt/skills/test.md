# /test スキル

テストを実行します。プロジェクト種類を自動検出して適切なテストコマンドを実行。

## 実行内容

1. **プロジェクト検出**
   - `package.json` → JavaScript/TypeScript
   - `Cargo.toml` → Rust
   - `pyproject.toml` / `pytest.ini` → Python
   - `go.mod` → Go

2. **テスト実行**
   - 適切なテストコマンドを実行
   - 結果をレポート

## プロジェクト別コマンド

| プロジェクト | コマンド |
|-------------|---------|
| Bun/Node.js | `bun test` / `npm test` |
| Rust | `cargo test` |
| Python | `pytest` |
| Go | `go test ./...` |

## オプション

```bash
/test                    # 全テスト実行
/test --watch            # ウォッチモード
/test --coverage         # カバレッジ取得
/test src/utils/         # 特定ディレクトリのみ
/test --filter "test_*"  # フィルタ指定
```

## テスト失敗時

1. 失敗したテストを分析
2. 原因を特定
3. 修正案を提示
4. 修正後に再テスト
