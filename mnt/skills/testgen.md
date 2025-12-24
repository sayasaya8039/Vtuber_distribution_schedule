# /testgen スキル

テストコードを自動生成します。

## 対応する言語・フレームワーク

### TypeScript/JavaScript

| フレームワーク | 対応状況 |
|--------------|----------|
| **Bun Test** | ✅ 推奨 |
| **Vitest** | ✅ |
| **Jest** | ✅ |
| **React Testing Library** | ✅ |

### Python

| フレームワーク | 対応状況 |
|--------------|----------|
| **pytest** | ✅ 推奨 |
| **unittest** | ✅ |

## 生成内容

### ユニットテスト

```typescript
// ソースコード: sum.ts
export function sum(a: number, b: number): number {
  return a + b;
}

// 自動生成されるテスト: sum.test.ts
import { describe, expect, test } from 'bun:test';
import { sum } from './sum';

describe('sum', () => {
  test('正の数を足し合わせる', () => {
    expect(sum(1, 2)).toBe(3);
  });

  test('負の数も正しく扱う', () => {
    expect(sum(-1, -2)).toBe(-3);
  });

  test('ゼロを含む計算', () => {
    expect(sum(0, 5)).toBe(5);
  });

  test('小数も正しく扱う', () => {
    expect(sum(0.1, 0.2)).toBeCloseTo(0.3);
  });
});
```

### Reactコンポーネントテスト

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'bun:test';
import Counter from './Counter';

describe('Counter', () => {
  test('初期値は0', () => {
    render(<Counter />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('増ボタンでカウントが増える', () => {
    render(<Counter />);
    const button = screen.getByText('増やす');
    button.click();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
```

### Pythonテスト

```python
# 自動生成されるテスト: test_calculator.py
import pytest
from calculator import add, subtract

class TestAdd:
    def test_正の数を足し合わせる(self):
        assert add(1, 2) == 3

    def test_負の数も正しく扱う(self):
        assert add(-1, -2) == -3

    def test_ゼロを含む計算(self):
        assert add(0, 5) == 5

class TestSubtract:
    def test_正の数を引く(self):
        assert subtract(5, 3) == 2

    def test_負の数も正しく扱う(self):
        assert subtract(-1, -2) == 1
```

## 実行内容

1. **ソースコード解析**
   - 関数・クラス・コンポーネントを特定
   - 入力・出力の型を分析

2. **テストケース生成**
   - 正常系：基本機能
   - 境界値：0、null、空文字
   - 異常系：エラーハンドリング

3. **テストファイル作成**
   - 適切な場所にテストファイルを作成
   - 実行して検証

## オプション

```bash
/testgen src/utils/format.ts    # 特定ファイルのテストを生成
/testgen src/components/         # ディレクトリ全体のテストを生成
/testgen --coverage             # カバレッジ目标を指定
/testgen --framework vitest     # フレームワークを指定
/testgen --update               # 既存テストを更新
/testgen --mock                 # モックを含めて生成
```

## カバレッジ目標

```bash
# テスト実行とカバレッジ計測
bun test --coverage

# 目標カバレッジ
- ステートメント: 80%以上
- ブランチ: 75%以上
- 関数: 80%以上
- 行: 80%以上
```

## テスト命名規則

```typescript
// 良い例
describe('UserService', () => {
  test('ユーザーが存在する場合_ユーザー情報を返す', () => {});
  test('ユーザーが存在しない場合_nullを返す', () => {});
  test('無効なIDの場合_エラーをスローする', () => {});
});

# Python
class TestUserService:
    def test_ユーザーが存在する場合_ユーザー情報を返す(self):
        pass
```

## 注意事項

- 生成されたテストは必ずレビューすること
- エッジケースは手動で追加必要
- モックは実際のAPI・DBと整合性を保つ
- テストは独立して実行できること
