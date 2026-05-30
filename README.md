# 言語学習ローカルWebアプリ

Mac 上でローカル動作する、英語・中国語学習用の Web アプリです。
ビルド不要のフロントエンドと Express バックエンドで、単語帳、復習モード、学習履歴をローカル JSON に保存します。

## 主な機能

- ホーム画面
- 単語帳
  - 手動登録
  - 検索
  - 言語フィルター
  - ステータスフィルター
  - 編集
  - 削除
  - ステータス変更
- 復習モード
  - ランダム出題
  - 答えの表示
  - 覚えた / まだ不安
  - 復習回数更新
  - 習得ステータス更新
- 学習履歴
  - 一覧表示
  - 詳細表示
  - 削除

## 構成

- `frontend`
  - ブラウザ画面
  - 日本語 UI
  - 単語帳、復習画面、履歴画面
- `backend`
  - Express
  - 学習履歴保存
  - 単語帳保存
  - 学習アイテム保存
  - SRS データ保存
  - 学習セッション保存
  - 学習ログ保存
  - 復習 API
- `backend/data`
  - `history.json`
  - `notebook.json`
  - `learning-items.json`
  - `srs-data.json`
  - `learning-sessions.json`
  - `study-logs.json`

## 起動方法

### 1. 依存関係をインストール

```bash
npm install
```

### 2. 開発サーバーを起動

```bash
npm run dev
```

起動後:

- アプリ: `http://localhost:8787`

ポートを変えたい場合は `.env` に次のように設定します。

```env
PORT=8787
```

## Vercel で使う場合

Vercel では静的アプリとして配信します。
外部DBをまだ使わないため、Vercel上のデータは利用中ブラウザの `localStorage` に保存されます。
端末やブラウザをまたいだ同期は、今後DBを追加する段階で対応します。

### Supabase Auth

ログイン機能には Supabase Auth を使います。
Vercel の Project Settings で次の環境変数を設定してください。

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

このアプリは Next.js ではないため、Vercel のビルド時に `frontend/supabase-config.js` を生成してブラウザへ公開設定を渡します。
使用するのは anon public key のみです。`service_role` key は設定しないでください。
現時点では認証のみを導入しており、学習データの保存先はまだ Supabase DB に移行していません。

## 使い方

### ホーム画面

起動するとホーム画面が開きます。
左側のメニュー、またはホームの各カードから目的の画面に移動できます。

### 単語帳

1. `単語帳` を開く
2. 右側のフォームに単語、意味、例文、メモなどを入力する
3. `保存` を押して登録する
4. 一覧の `詳細表示` で編集欄に読み込む
5. 内容を修正して保存、または削除する

### 復習モード

1. 必要なら言語を絞る
2. `ランダム出題` を押す
3. `答えを表示` で意味や例文を確認する
4. `覚えた` または `まだ不安` を押す
5. `次の単語` で次へ進む

### 学習履歴

- 保存済みの学習記録を一覧表示
- `詳細表示` で中身を確認
- `削除` で消去

## 保存先

- 学習履歴: `backend/data/history.json`
- 単語帳: `backend/data/notebook.json`
- 学習アイテム: `backend/data/learning-items.json`
- SRS データ: `backend/data/srs-data.json`
- 学習セッション: `backend/data/learning-sessions.json`
- 学習ログ: `backend/data/study-logs.json`

## 基礎データ API

### LearningItem

- 一覧: `GET /api/learning-items`
- 絞り込み: `GET /api/learning-items?type=vocabulary&language=english&tag=basic&query=word`
- 作成: `POST /api/learning-items`
- 詳細: `GET /api/learning-items/:id`
- 更新: `PATCH /api/learning-items/:id`
- 削除: `DELETE /api/learning-items/:id`

### SrsData

- 一覧: `GET /api/srs`
- 作成または置き換え: `POST /api/srs`
- 詳細: `GET /api/srs/:itemId`
- 更新: `PATCH /api/srs/:itemId`
- 削除: `DELETE /api/srs/:itemId`

### LearningSession

- 一覧: `GET /api/learning-sessions`
- 保存: `POST /api/learning-sessions`
- 詳細: `GET /api/learning-sessions/:id`

### StudyLog

- 一覧: `GET /api/study-logs`
- 保存: `POST /api/study-logs`
- 詳細: `GET /api/study-logs/:id`

## 今後追加しやすい機能

- 学習アイテム登録の拡張
- SRS 復習スケジュール
- 入力式テスト
- 学習タイマー
- 音声再生
- ディクテーション
- 音読録音
- 作文欄
- ChatGPT 添削用プロンプト生成
- 学習ログ
- セッション履歴
