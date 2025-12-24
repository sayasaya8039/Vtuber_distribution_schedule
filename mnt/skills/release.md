# /release スキル

GitHub Releasesにリリースを作成します。

## 実行内容

1. **事前チェック**
   - 未コミットの変更がないか確認
   - バージョン番号の確認
   - ビルド済みか確認

2. **タグ作成**
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

3. **リリース作成**
   ```bash
   gh release create vX.Y.Z ./AppName/AppName.exe --title "vX.Y.Z" --notes "リリースノート"
   ```

## オプション

```bash
/release                 # 現在のバージョンでリリース
/release v1.2.0          # バージョン指定
/release --draft         # ドラフトとして作成
/release --prerelease    # プレリリースとして作成
```

## リリースノート自動生成

- 前回リリースからのコミットを分析
- 変更内容をカテゴリ分け
  - 🆕 新機能
  - 🐛 バグ修正
  - ⚡ パフォーマンス改善
  - 📝 ドキュメント

## リリース前チェックリスト

- [ ] バージョン番号を更新
- [ ] CHANGELOG.mdを更新
- [ ] テストが全て通過
- [ ] ビルドが成功
- [ ] README.mdが最新

## 使用例

```bash
# 通常リリース
/release

# バージョン指定
/release v2.0.0

# ドラフト作成
/release --draft

# 複数ファイルをアップロード
/release --files "./dist/*.exe,./dist/*.zip"
```
