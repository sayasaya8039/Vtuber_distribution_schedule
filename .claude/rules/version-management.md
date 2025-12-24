# バージョン管理ルール

## バージョン形式: `MAJOR.MINOR.PATCH`

| 変更種類 | 更新箇所 | 例 |
|----------|----------|-----|
| 大幅な機能追加・破壊的変更 | MAJOR | `1.0.0` → `2.0.0` |
| 機能追加・改善 | MINOR | `1.0.0` → `1.1.0` |
| バグ修正・微調整 | PATCH | `1.0.0` → `1.0.1` |

## 更新対象ファイル

| プロジェクト種類 | 更新ファイル |
|------------------|--------------|
| Chrome拡張機能 | `manifest.json` の `version` |
| Node.jsアプリ | `package.json` の `version` |
| Pythonアプリ | `pyproject.toml` または `__version__` |

## 更新タイミング

- **必ずコミット前にバージョンを更新**
- 複数の修正をまとめる場合は最も影響の大きい変更に合わせる
- バージョン更新はコミットメッセージに含める
  - 例: `[feat] v1.2.0 - 新機能を追加`

## アプリ内バージョン表示（必須）

**すべてのアプリ・拡張機能にバージョン番号をUI上に表示すること**

```tsx
// Chrome拡張機能
const version = chrome.runtime.getManifest().version;
<span>v{version}</span>

// Webアプリ（Vite）
<span>v{import.meta.env.VITE_APP_VERSION}</span>

// Pythonアプリ
from myapp import __version__
self.setWindowTitle(f"MyApp v{__version__}")
```

## EXEファイルのリリース

```bash
# リリース作成
gh release create v1.0.0 ./アプリ名/アプリ名.exe --title "v1.0.0" --notes "リリースノート"

# 既存リリースにファイル追加
gh release upload v1.0.0 ./アプリ名/アプリ名.exe
```
