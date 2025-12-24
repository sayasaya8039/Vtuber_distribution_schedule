# VTuber Schedule Calendar

複数VTuberの配信スケジュールをGoogle Calendarに自動統合するChrome拡張機能 🎭📅

## 機能

### 核心機能
- **複数VTuber対応**: hololive、にじさんじ、インディー等、複数のVTuberを一括管理
- **Holodex API連携**: 配信スケジュールを自動取得（1週間先まで）
- **Google Calendar統合**: ワンクリックでカレンダーにイベント追加
- **自動同期**: 定期的にスケジュールをチェック（デフォルト: 1時間ごと）
- **通知機能**: 新しい配信予定をプッシュ通知でお知らせ

### UI機能
- **Side Panel**: サイドパネルでスケジュール一覧を表示
- **VTuber検索**: 名前でVTuberを検索して追加
- **組織別カラー**: hololive(青)、にじさんじ(赤)、インディー(紫)で色分け
- **リマインダー設定**: 配信開始前の通知時間をカスタマイズ

## セットアップ

### 1. Holodex APIキーの取得
1. [Holodex](https://holodex.net/login) でアカウント作成
2. 設定からAPIキーを取得
3. 拡張機能の設定画面でAPIキーを入力

### 2. Google Calendar連携
1. 拡張機能の設定画面で「Googleカレンダーに接続」をクリック
2. Googleアカウントでログイン
3. カレンダーへのアクセスを許可

### 3. VTuberの追加
1. サイドパネルを開く
2. 「VTuber」タブで推しを検索
3. 「+」ボタンで追加

## 使い方

1. Chromeの拡張機能アイコンをクリック
2. 「サイドパネルを開く」でスケジュール一覧を表示
3. 配信予定の「📅」ボタンでカレンダーに追加
4. 「全て追加」で一括追加も可能

## 技術スタック

- **フレームワーク**: React 19 + TypeScript
- **ビルド**: Vite 6
- **状態管理**: Zustand
- **Chrome拡張**: Manifest V3
- **API**: Holodex API, Google Calendar API

## ディレクトリ構成

```
Vtuber_distribution_schedule/
├── src/
│   ├── background/       # Service Worker
│   ├── components/       # Reactコンポーネント
│   ├── lib/             # ユーティリティ
│   ├── popup/           # ポップアップUI
│   ├── sidepanel/       # サイドパネルUI
│   └── types/           # 型定義
├── public/              # 静的ファイル
└── VtuberScheduleCalendar/  # ビルド出力
```

## ビルド

```bash
# 依存関係インストール
bun install

# ビルド
bun run build

# 開発モード（ウォッチ）
bun run dev
```

## インストール

1. `chrome://extensions` を開く
2. 「デベロッパーモード」を有効化
3. 「パッケージ化されていない拡張機能を読み込む」
4. `VtuberScheduleCalendar` フォルダを選択

## ライセンス

MIT

## バージョン

- v1.0.0 - 初回リリース
