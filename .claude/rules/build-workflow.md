# ビルドワークフロー

## 必須フロー（この順番で必ず実行）

### 1. コード作成・修正

### 2. バージョン更新（必須）
- 機能追加・修正・バグ修正があれば必ずバージョンを更新
- MAJOR: 破壊的変更、MINOR: 機能追加、PATCH: バグ修正
- manifest.json、package.json、pyproject.toml等を更新

### 3. ビルド前デバッグ（必須）
- lint、型チェックを実行（`bun run lint`, `bun run typecheck`）
- エラーがあれば修正してから次へ進む

### 4. ビルド実行
- 出力先はアプリ名フォルダ（distは使わない）
- 例: `my-chrome-extension/` `volume-manager/`

### 5. ビルド後デバッグ・テスト（必須）
- ユニットテストを実行（`bun test`）
- ビルド成果物の整合性確認
- エラーがあれば修正して手順3から再実行

### 6. 動作確認
- Webアプリ → ローカルで動作確認
- 拡張機能 → 読み込みテスト
- Windowsアプリ → 起動確認

### 7. README.md作成・更新（必須）
- タスク完了時に必ず作成または更新
- プロジェクトルートに配置
- ビルドフォルダ内にも配置
- 含める内容：概要、機能一覧、インストール方法、使い方、技術スタック

### 8. Git操作（自動で最後まで実行）
```bash
git add .
git commit -m "[種類] 変更内容"
git pull origin main --rebase
git push origin main
```

### 9. note記事作成の確認
- 「note記事を作成しますか？」とユーザーに確認
- 「はい」→ note記事作成ガイドラインに従って作成
- 「いいえ」→ スキップして完了

## プロジェクト種類別の追加作業

| 種類 | 追加作業 |
|------|----------|
| Webアプリ | Cloudflare Workersにデプロイ |
| Chrome拡張 | Pythonでアイコン作成（icons/フォルダ）、ZIPファイル作成 |
| Windowsアプリ | EXE生成確認、GitHub Releasesで配布 |

## Webアプリのデプロイ（必須）

- **Webアプリは必ずCloudflare Workersにデプロイすること**
- `wrangler` CLIを使用
- デプロイ前に動作確認を完了させる

```bash
# Bun推奨
bun run build
bunx wrangler deploy

# または npm使用時
npm run build
npx wrangler deploy
```

## 確認不要ルール

- **ステップ1〜8は自動で実行（確認不要）**
- **ステップ9（note記事作成）のみユーザーに確認**
- エラーが出たら自動で修正して続行
- Git push完了まで止まらない
- デプロイも自動で実行

## ビルド規則

- `dist/` `build/` フォルダは使用禁止
- ビルド出力は **アプリ名のフォルダ** に出力する

## ブラウザ拡張機能のアイコン作成（必須）

- **Pythonを使用してアイコンファイルを生成すること**
- Pillowライブラリを使用
- 必要サイズ：16x16, 32x32, 48x48, 128x128
- 出力形式：PNG
- **出力先：`icons/` フォルダ内に作成（ZIPではない）**

```python
from PIL import Image, ImageDraw

def create_icon(size, output_path):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # デザイン処理
    img.save(output_path)

for size in [16, 32, 48, 128]:
    create_icon(size, f"icons/icon{size}.png")
```


## ビルドエラーの学習

**同じ過ちは絶対に繰り返さない**

1. **エラー発生時**
   - 原因を特定し、根本原因を理解
   - 修正方法を記録

2. **修正後**
   - 同じパターンのエラーを予防するコードを書く
   - 類似箇所がないかプロジェクト全体を確認

3. **記録**
   - エラーパターンをMemory MCPに保存
   - 次回以降の開発で同じミスを防止
