# /build スキル

プロジェクトをビルドします。プロジェクト種類を自動検出して適切なビルドコマンドを実行。

## 実行内容

1. **プロジェクト検出**
   - `package.json` → Bun/Node.js
   - `Cargo.toml` → Rust
   - `pyproject.toml` → Python
   - `wrangler.toml` → Cloudflare Workers

2. **ビルド前チェック**
   - lint実行
   - 型チェック

3. **ビルド実行**
   - 適切なビルドコマンドを実行
   - 出力先はアプリ名フォルダ（dist/は使用禁止）

## プロジェクト別コマンド

| プロジェクト | コマンド | 出力先 |
|-------------|---------|--------|
| Vite | `bun run build` | `AppName/` |
| Electron | `npm run make` | `out/` |
| Tauri | `cargo tauri build` | `src-tauri/target/release/` |
| Rust | `cargo build --release` | `target/release/` |
| Python | `pyinstaller --onefile` | `AppName/` |

## オプション

```bash
/build                   # リリースビルド
/build --dev             # 開発ビルド
/build --watch           # ウォッチモード
/build --no-lint         # lintスキップ
```

## ビルド後

1. ビルド成果物の確認
2. README.mdをビルドフォルダにコピー
3. バージョン番号の確認
