# /bun-test スキル

Bunテストランナーを使用してテストを実行します。

## 実行内容

1. **テストファイル検出**
   - `*.test.{ts,tsx,js,jsx}`
   - `*.spec.{ts,tsx,js,jsx}`
   - `*_test.{ts,tsx,js,jsx}`

2. **テスト実行**

3. **結果レポート・カバレッジ**

---

## 基本コマンド

```bash
# 全テスト実行
bun test

# 特定ファイル
bun test ./tests/user.test.ts

# パターンマッチ
bun test user        # "user" を含むファイル
bun test auth login  # 複数パターン
```

---

## 重要なオプション

### フィルタリング

```bash
# テスト名でフィルタ
bun test --test-name-pattern "should add"

# 特定ディレクトリ
bun test ./tests/unit/
```

### 実行制御

| オプション | 説明 | デフォルト |
|-----------|------|----------|
| `--watch` | ファイル変更時に再実行 | - |
| `--timeout <ms>` | タイムアウト時間 | 5000 |
| `--bail <n>` | n回失敗で終了 | - |
| `--rerun-each <n>` | 各テストをn回実行 | 1 |

```bash
# ウォッチモード
bun test --watch

# タイムアウト延長
bun test --timeout 30000

# 最初の失敗で停止
bun test --bail 1
```

### 並行実行

| オプション | 説明 |
|-----------|------|
| `--concurrent` | 全テスト並行実行 |
| `--max-concurrency <n>` | 最大並行数 |

```bash
bun test --concurrent --max-concurrency 10
```

---

## テストの書き方

### 基本構造

```typescript
import { test, expect, describe } from "bun:test";

describe("Calculator", () => {
  test("1 + 1 = 2", () => {
    expect(1 + 1).toBe(2);
  });

  test("非同期テスト", async () => {
    const result = await fetchData();
    expect(result).toBeDefined();
  });
});
```

### ライフサイクルフック

```typescript
import { beforeAll, afterAll, beforeEach, afterEach } from "bun:test";

beforeAll(() => {
  // 全テスト前に1回
});

afterAll(() => {
  // 全テスト後に1回
});

beforeEach(() => {
  // 各テスト前
});

afterEach(() => {
  // 各テスト後
});
```

### スキップ・TODO

```typescript
test.skip("スキップするテスト", () => {
  // 実行されない
});

test.todo("後で実装するテスト");

test.if(process.platform === "linux")("Linuxのみ", () => {
  // 条件付き実行
});
```

---

## モック

```typescript
import { test, expect, mock, spyOn } from "bun:test";

// モック関数
const mockFn = mock(() => 42);
mockFn();
expect(mockFn).toHaveBeenCalled();

// スパイ
const obj = { method: () => "original" };
const spy = spyOn(obj, "method").mockReturnValue("mocked");
expect(obj.method()).toBe("mocked");
```

### モジュールモック

```typescript
import { mock } from "bun:test";

mock.module("./database", () => ({
  query: mock(() => [{ id: 1 }]),
}));
```

---

## スナップショット

```typescript
test("スナップショットテスト", () => {
  const data = { name: "Alice", age: 30 };
  expect(data).toMatchSnapshot();
});
```

```bash
# スナップショット更新
bun test --update-snapshots
```

---

## カバレッジ

```bash
# カバレッジ有効化
bun test --coverage

# レポーター指定
bun test --coverage --coverage-reporter=lcov

# しきい値設定
bun test --coverage --coverage-threshold=80
```

**カバレッジレポーター:**
- `text`（デフォルト）
- `lcov`
- `json`

---

## レポーター

```bash
# JUnit XML形式
bun test --reporter=junit --reporter-outfile=./results.xml

# 複数レポーター
bun test --reporter=default --reporter=junit
```

---

## マッチャー一覧

| マッチャー | 説明 |
|-----------|------|
| `toBe(value)` | 厳密等価 |
| `toEqual(value)` | 深い等価 |
| `toBeTruthy()` | truthy |
| `toBeFalsy()` | falsy |
| `toBeNull()` | null |
| `toBeUndefined()` | undefined |
| `toBeDefined()` | 定義済み |
| `toContain(item)` | 配列に含む |
| `toHaveLength(n)` | 長さ |
| `toThrow()` | 例外をスロー |
| `toMatchSnapshot()` | スナップショット一致 |

---

## package.json 設定

```json
{
  "scripts": {
    "test": "bun test",
    "test:watch": "bun test --watch",
    "test:coverage": "bun test --coverage"
  }
}
```

---

## 使用例

```bash
# 開発時（ウォッチモード）
bun test --watch

# CI/CD
bun test --coverage --bail 1

# 特定テストのデバッグ
bun test --test-name-pattern "login" --timeout 30000
```
