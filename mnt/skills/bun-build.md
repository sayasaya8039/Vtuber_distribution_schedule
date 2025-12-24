# /bun-build スキル

Bunバンドラーを使用してビルド・コンパイルを行います。

## 実行内容

1. **ビルド設定確認**
   - エントリーポイント
   - 出力先
   - ターゲット環境

2. **ビルド実行**

3. **結果確認**

---

## 基本コマンド

### CLI

```bash
# 基本ビルド
bun build ./src/index.ts --outdir ./dist

# 複数エントリーポイント
bun build ./src/index.ts ./src/worker.ts --outdir ./dist
```

### JavaScript API

```typescript
const result = await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
});

if (!result.success) {
  console.error(result.logs);
}
```

---

## 主要オプション

### 出力設定

| オプション | 説明 | デフォルト |
|-----------|------|----------|
| `--outdir <dir>` | 出力ディレクトリ | - |
| `--outfile <file>` | 単一ファイル出力 | - |
| `--format <fmt>` | `esm`, `cjs`, `iife` | `esm` |
| `--target <env>` | `browser`, `bun`, `node` | `browser` |

```bash
# ブラウザ向けESM
bun build ./src/index.ts --outdir ./dist --target browser --format esm

# Node.js向けCJS
bun build ./src/index.ts --outdir ./dist --target node --format cjs

# Bun向け
bun build ./src/index.ts --outdir ./dist --target bun
```

### 最適化

| オプション | 説明 |
|-----------|------|
| `--minify` | 全体を最小化 |
| `--minify-syntax` | 構文のみ最小化 |
| `--minify-whitespace` | 空白のみ削除 |
| `--minify-identifiers` | 識別子を短縮 |

```bash
# 本番ビルド
bun build ./src/index.ts --outdir ./dist --minify
```

### コード分割

```bash
bun build ./src/index.ts --outdir ./dist --splitting
```

```typescript
await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  splitting: true,
});
```

### ソースマップ

| オプション | 説明 |
|-----------|------|
| `--sourcemap=linked` | 別ファイル |
| `--sourcemap=inline` | インライン埋め込み |
| `--sourcemap=external` | 外部ファイル（リンクなし） |
| `--sourcemap=none` | 生成しない |

```bash
bun build ./src/index.ts --outdir ./dist --sourcemap=linked
```

---

## 単一実行ファイル生成

`--compile` オプションで単一バイナリを生成

```bash
# 基本
bun build ./src/index.ts --compile --outfile myapp

# クロスコンパイル
bun build ./src/index.ts --compile --target=bun-linux-x64 --outfile myapp-linux
bun build ./src/index.ts --compile --target=bun-windows-x64 --outfile myapp.exe
bun build ./src/index.ts --compile --target=bun-darwin-arm64 --outfile myapp-mac
```

**利用可能なターゲット:**
- `bun-linux-x64`
- `bun-linux-arm64`
- `bun-darwin-x64`
- `bun-darwin-arm64`
- `bun-windows-x64`

---

## 外部モジュール

バンドルから除外するモジュールを指定

```bash
bun build ./src/index.ts --outdir ./dist --external express --external lodash
```

```typescript
await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  external: ['express', 'lodash'],
});
```

---

## 環境変数

```bash
# インライン埋め込み
bun build ./src/index.ts --outdir ./dist --define 'process.env.NODE_ENV="production"'
```

```typescript
await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
```

---

## ローダー

| 拡張子 | デフォルトローダー |
|--------|-------------------|
| `.ts`, `.tsx` | TypeScript |
| `.js`, `.jsx` | JavaScript |
| `.json` | JSON |
| `.css` | CSS |
| `.txt` | テキスト |
| その他 | ファイルコピー |

```typescript
await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  loader: {
    '.svg': 'file',
    '.png': 'dataurl',
  },
});
```

---

## プラグイン

```typescript
import { plugin } from 'bun';

const myPlugin = {
  name: 'my-plugin',
  setup(build) {
    build.onLoad({ filter: /\.yaml$/ }, async (args) => {
      const text = await Bun.file(args.path).text();
      const yaml = parseYaml(text);
      return {
        contents: `export default ${JSON.stringify(yaml)}`,
        loader: 'js',
      };
    });
  },
};

await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  plugins: [myPlugin],
});
```

---

## ビルド結果

```typescript
const result = await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
});

if (result.success) {
  for (const output of result.outputs) {
    console.log(output.path);  // 出力ファイルパス
    console.log(output.kind);  // 'entry-point', 'chunk', 'asset'
    console.log(output.hash);  // コンテンツハッシュ
  }
} else {
  for (const log of result.logs) {
    console.error(log.message);
  }
}
```

---

## 使用例

```bash
# 開発ビルド
bun build ./src/index.ts --outdir ./dist --sourcemap=linked

# 本番ビルド
bun build ./src/index.ts --outdir ./dist --minify --splitting

# CLI実行ファイル作成
bun build ./src/cli.ts --compile --outfile mycli

# Windowsクロスコンパイル
bun build ./src/app.ts --compile --target=bun-windows-x64 --outfile app.exe
```

---

## package.json 設定例

```json
{
  "scripts": {
    "build": "bun build ./src/index.ts --outdir ./dist --minify",
    "build:dev": "bun build ./src/index.ts --outdir ./dist --sourcemap=linked",
    "compile": "bun build ./src/index.ts --compile --outfile ./bin/myapp"
  }
}
```
