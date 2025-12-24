# /note スキル

note記事を作成します。詳細なルールは `../../.claude/rules/note-writing.md` を参照。

## 実行内容

1. **リサーチ実行**
   - WebSearchで関連情報を収集
   - 海外サイト、Reddit、ブログ、YouTube等を参照

2. **記事作成**
   - `note-writing.md` のルールに従って記事を作成
   - 構成：導入（150〜250字）→ 本論（1,000〜1,500字）→ 結論（200〜400字）
   - 必須要素を末尾に追加（メッセージ招待文、ハッシュタグ20個）

3. **画像プロンプト生成**
   - Midjourney用の英文プロンプトを4枚分作成

## オプション

```bash
/note "テーマ"           # テーマを指定して記事作成
/note --tech             # 技術記事向けスタイル
/note --lifestyle        # ライフスタイル記事向けスタイル
```

## 保存先

- `articles/YYYY-MM-DD_タイトル.md`
- GitHubにはアップロードしない（.gitignore対象）
