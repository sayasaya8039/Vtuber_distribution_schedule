# /optimize スキル

コードのパフォーマンスを分析して最適化します。

## 対応する最適化

### フロントエンド

| 項目 | チェック内容 | 最適化手法 |
|------|-------------|-----------|
| **バンドルサイズ** | webpack-bundle-analyzer | Tree-shaking、コード分割 |
| **再レンダリング** | React DevTools | useMemo、useCallback、React.memo |
| **画像** | 画像サイズ・形式 | WebP変換、遅延読み込み |
| **フォント** | フォントサイズ | フォントサブセット、preload |
| **CSS** | 未使用CSS | PurgeCSS、Critical CSS |
| **初期読み込み** | Lighthouse | 動的インポート、プリフェッチ |

### バックエンド

| 項目 | チェック内容 | 最適化手法 |
|------|-------------|-----------|
| **DBクエリ** | EXPLAIN ANALYZE | インデックス追加、N+1解消 |
| **APIレスポンス** | レスポンス時間 | キャッシュ、ページネーション |
| **メモリ** | メモリプロファイラ | ストリーム処理、バッチ処理 |
| **並列処理** | 処理時間 | 非同期処理、Web Workers |

### Python

| 項目 | チェック内容 | 最適化手法 |
|------|-------------|-----------|
| **ループ** | 計算量 | 内包表記、NumPy使用 |
| **I/O** | 待ち時間 | 非同期I/O（asyncio） |
| **メモリ** | メモリ使用量 | ジェネレータ、チャンキング |

## 実行内容

1. **分析**
   - パフォーマンス計測ツールを実行
   - ボトルネックを特定

2. **提案**
   - 改善可能な箇所をリストアップ
   - 優先順位付け

3. **実装**
   - 主要な最適化を実装
   - Before/Afterの計測

## オプション

```bash
/optimize                # 全体を分析
/optimize --frontend     # フロントエンドのみ
/optimize --backend      # バックエンドのみ
/optimize --db           # データベースのみ
/optimize --analyze      # 分析のみ（実装しない）
/optimize --bundle       # バンドルサイズ最適化のみ
```

## 計測コマンド例

### フロントエンド

```bash
# Bundle解析
bunx vite-bundle-visualizer

# Lighthouse
bunx lighthouse http://localhost:5173 --view

# Reactプロファイリング
# Chrome DevTools > Profiler
```

### バックエンド

```bash
# DBクエリ分析
EXPLAIN ANALYZE <query>;

# Pythonプロファイリング
python -m cProfile -s cumtime script.py

# メモリプロファイリング
python -m memory_profiler script.py
```

## よくある最適化パターン

### React

```tsx
// Before: 毎回再計算
const sorted = items.sort((a, b) => a.id - b.id);

// After: メモ化
const sorted = useMemo(() =>
  items.sort((a, b) => a.id - b.id),
  [items]
);

// Before: 再レンダリング
<Item data={item} updateParent={updateParent} />

// After: 関数をメモ化
const updateParent = useCallback(() => { ... }, [deps]);
<Item data={item} updateParent={updateParent} />
```

### Python

```python
# Before: 遅いループ
result = []
for item in items:
    result.append(process(item))

# After: 内包表記
result = [process(item) for item in items]

# Before: 全て読み込み
with open('large.txt') as f:
    data = f.readlines()  # メモリ消費大

# After: ジェネレータ
with open('large.txt') as f:
    for line in f:  # 1行ずつ処理
        process(line)
```

## 注意事項

- 「計測なき最適化は避ける」- まず計測すること
- 早期最適化は避ける
- 可読性とのバランスを考慮
- 最適化の前後で必ず計測
