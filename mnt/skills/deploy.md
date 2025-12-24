# /deploy スキル

Cloudflare Workersへのデプロイを自動化します。

## 実行内容

1. **事前チェック**
   - `wrangler.toml` の存在確認
   - ビルド済みかどうか確認
   - 未コミットの変更がないか確認

2. **ビルド実行**
   ```bash
   bun run build
   # または npm run build
   ```

3. **デプロイ実行**
   ```bash
   bunx wrangler deploy
   # または npx wrangler deploy
   ```

4. **デプロイ結果確認**
   - デプロイ先URLを表示
   - 動作確認（Playwright等でスクリーンショット）

## プロジェクト種類別

### Honoアプリ

```bash
bun run build
bunx wrangler deploy
```

### Vite + React

```bash
bun run build
bunx wrangler pages deploy ./dist
```

### Next.js

```bash
bun run build
bunx wrangler pages deploy ./out
```

## オプション

```bash
/deploy                  # 本番環境にデプロイ
/deploy --preview        # プレビュー環境にデプロイ
/deploy --dry-run        # 実行せずに確認のみ
```

## 必要な設定

### wrangler.toml（Hono）

```toml
name = "my-app"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"
```

### wrangler.toml（Pages）

```toml
name = "my-site"
pages_build_output_dir = "./dist"
```

## トラブルシューティング

| 問題 | 解決策 |
|------|--------|
| 認証エラー | `wrangler login` を実行 |
| ビルドエラー | `bun run build` を個別実行して確認 |
| 権限エラー | Cloudflareダッシュボードでプロジェクト設定確認 |
