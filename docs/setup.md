# レポートダッシュボード 導入手順書

---

## 全体の流れ

```
① Googleの準備
        ↓
② Supabaseの準備
        ↓
③ Vercelへのデプロイ
        ↓
④ スプレッドシートの準備
        ↓
⑤ GASの設定
        ↓
⑥ 動作確認
```

---

## ① Googleの準備

### 1-1. サービスアカウントの作成（スプシへのAPIアクセス用） （※全案件共通）

1. [Google Cloud Console](https://console.cloud.google.com) にアクセス
2. 新しいプロジェクトを作成
3. 「APIとサービス」→「ライブラリ」から「Google Sheets API」を有効化
4. 「APIとサービス」→「認証情報」→「認証情報を作成」→「サービスアカウント」を選択
   - [「APIとサービス」](https://gyazo.com/11c76a7169b748d69e756805c9992e48)
   - [「認証情報」](https://gyazo.com/8f2125de8bf347475f9b766098e869fa)
   - [「認証情報を作成」→「サービスアカウント」](https://gyazo.com/4514624c4d2284609deb126bbf300bc4)
5. サービスアカウントを作成後、「キー」タブから「JSONキーを作成」
   - [サービスアカウント名、サービスアカウントIDを入力後、「作成して閉じる」ボタンをクリック](https://gyazo.com/5fa9d3fd84cefec4638ad169e902c9d2)
   - [作成されたサービスアカウントをクリック](https://gyazo.com/0d397843d4db90ed1a830d9b1411fc73)
   - [「キー」](https://gyazo.com/7c32a4681164a8724bec9c2b9c6a04ee)
   - [「新しい鍵を作成」](https://gyazo.com/c2fa1cf1305fa85204cf5400fd46a1fc)
   - [「JSON」にチェックを入れて作成](https://gyazo.com/3f2fec5dd796a9af9771e1df3209500f)
6. ダウンロードしたJSONファイルから以下を控える：
   - `client_email`（例: `xxxxx@xxxxx.iam.gserviceaccount.com`）
   - `private_key`（`-----BEGIN PRIVATE KEY-----` から始まる文字列）

### 1-2. OAuthクライアントIDの作成（Googleログイン用） （※全案件共通）

1. 「APIとサービス」→「認証情報」→「認証情報を作成」→「OAuthクライアントID」を選択
   - [「APIとサービス」](https://gyazo.com/11c76a7169b748d69e756805c9992e48)
   - [「認証情報」](https://gyazo.com/8f2125de8bf347475f9b766098e869fa)
   - [「OAuthクライアントID」](https://gyazo.com/b97dd5d08f2ec1fc0e2d42cdbba6e6a1)
2. アプリケーションの種類：「ウェブアプリケーション」を選択
3. 名前を入力（例：ファーマフーズ株式会社｜ニューモ）
4. 作成後、以下を控える：
   - クライアントID
   - クライアントシークレット

---

## ② Supabaseの準備

### 2-1. プロジェクト作成

1. [supabase.com](https://supabase.com) にアクセスしてアカウント作成
2. [「New Project」](https://gyazo.com/f1c18fc605e431439477f17e1bd13630)をクリック
3. 以下を入力：
   - Project name: 任意
   - Database Password: 任意（メモしておく）
   - Region: `Northeast Asia (Tokyo)`
4. 「Enable Data API」「Automatically expose new tables」はチェックを入れたままでOK

### 2-2. テーブル・ビューの作成

[「SQL Editor」](https://gyazo.com/de25b01a6435ef81534d34ddb3e98dfe)で以下を実行：

```sql
-- 日次レポートテーブル
CREATE TABLE daily_reports (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  pv INTEGER NOT NULL DEFAULT 0,
  imp INTEGER NOT NULL DEFAULT 0,
  cl INTEGER NOT NULL DEFAULT 0,
  friend INTEGER NOT NULL DEFAULT 0,
  cv INTEGER NOT NULL DEFAULT 0,
  billing INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ポップアップ別日次レポートテーブル
CREATE TABLE daily_reports_by_p (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  p_value TEXT NOT NULL,
  pv INTEGER NOT NULL DEFAULT 0,
  imp INTEGER NOT NULL DEFAULT 0,
  cl INTEGER NOT NULL DEFAULT 0,
  friend INTEGER NOT NULL DEFAULT 0,
  cv INTEGER NOT NULL DEFAULT 0,
  billing INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, p_value)
);

-- シナリオ別日次レポートテーブル
CREATE TABLE daily_reports_by_s (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  s_value TEXT NOT NULL,
  pv INTEGER NOT NULL DEFAULT 0,
  imp INTEGER NOT NULL DEFAULT 0,
  cl INTEGER NOT NULL DEFAULT 0,
  friend INTEGER NOT NULL DEFAULT 0,
  cv INTEGER NOT NULL DEFAULT 0,
  billing INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, s_value)
);

-- 離脱地点別日次レポートテーブル
CREATE TABLE daily_reports_by_exit (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  exit_value TEXT NOT NULL,
  pv INTEGER NOT NULL DEFAULT 0,
  imp INTEGER NOT NULL DEFAULT 0,
  cl INTEGER NOT NULL DEFAULT 0,
  friend INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, exit_value)
);

-- 訴求別日次レポートテーブル
CREATE TABLE daily_reports_by_appeal (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  appeal_value TEXT NOT NULL,
  pv INTEGER NOT NULL DEFAULT 0,
  imp INTEGER NOT NULL DEFAULT 0,
  cl INTEGER NOT NULL DEFAULT 0,
  friend INTEGER NOT NULL DEFAULT 0,
  cv INTEGER NOT NULL DEFAULT 0,
  billing INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, appeal_value)
);

-- 期間別（共有用）テーブル
CREATE TABLE daily_reports_shared (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  cv INTEGER NOT NULL DEFAULT 0,
  unit_price INTEGER NOT NULL DEFAULT 0,
  billing INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- メモテーブル
CREATE TABLE daily_notes (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- クライアントユーザーテーブル
CREATE TABLE client_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- クライアントユーザーの閲覧権限テーブル
CREATE TABLE client_permissions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES client_users(id) ON DELETE CASCADE,
  page TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, page)
);

-- ユニークなp値のビュー
CREATE VIEW distinct_p_values AS
SELECT DISTINCT p_value FROM daily_reports_by_p ORDER BY p_value;

-- ユニークなs値のビュー
CREATE VIEW distinct_s_values AS
SELECT DISTINCT s_value FROM daily_reports_by_s ORDER BY s_value;

-- ユニークな離脱地点値のビュー
CREATE VIEW distinct_exit_values AS
SELECT DISTINCT exit_value FROM daily_reports_by_exit ORDER BY exit_value;

-- ユニークな訴求値のビュー
CREATE VIEW distinct_appeal_values AS
SELECT DISTINCT appeal_value FROM daily_reports_by_appeal ORDER BY appeal_value;

-- p別サマリ集計ビュー
CREATE VIEW summary_by_p AS
SELECT
  p_value,
  SUM(imp) as imp,
  SUM(cl) as cl,
  SUM(friend) as friend,
  SUM(cv) as cv,
  SUM(billing) as billing
FROM daily_reports_by_p
GROUP BY p_value
ORDER BY p_value;

-- s別サマリ集計ビュー
CREATE VIEW summary_by_s AS
SELECT
  s_value,
  SUM(imp) as imp,
  SUM(cl) as cl,
  SUM(friend) as friend,
  SUM(cv) as cv,
  SUM(billing) as billing
FROM daily_reports_by_s
GROUP BY s_value
ORDER BY s_value;
```

### 2-3. テーブル構成

#### daily_reports（日次レポート）
| 列名 | データ型 |
|---|---|
| id | BIGSERIAL |
| date | DATE |
| pv | INTEGER |
| imp | INTEGER |
| cl | INTEGER |
| friend | INTEGER |
| cv | INTEGER |
| billing | INTEGER |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

#### daily_reports_by_p（ポップアップ別）
| 列名 | データ型 |
|---|---|
| id | BIGSERIAL |
| date | DATE |
| p_value | TEXT |
| pv | INTEGER |
| imp | INTEGER |
| cl | INTEGER |
| friend | INTEGER |
| cv | INTEGER |
| billing | INTEGER |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

#### daily_reports_by_s（シナリオ別）
| 列名 | データ型 |
|---|---|
| id | BIGSERIAL |
| date | DATE |
| s_value | TEXT |
| pv | INTEGER |
| imp | INTEGER |
| cl | INTEGER |
| friend | INTEGER |
| cv | INTEGER |
| billing | INTEGER |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

#### daily_reports_by_exit（離脱地点別）
| 列名 | データ型 |
|---|---|
| id | BIGSERIAL |
| date | DATE |
| exit_value | TEXT |
| pv | INTEGER |
| imp | INTEGER |
| cl | INTEGER |
| friend | INTEGER |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

#### daily_reports_by_appeal（訴求別）
| 列名 | データ型 |
|---|---|
| id | BIGSERIAL |
| date | DATE |
| appeal_value | TEXT |
| pv | INTEGER |
| imp | INTEGER |
| cl | INTEGER |
| friend | INTEGER |
| cv | INTEGER |
| billing | INTEGER |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

#### daily_reports_shared（期間別共有用）
| 列名 | データ型 |
|---|---|
| id | BIGSERIAL |
| date | DATE |
| cv | INTEGER |
| unit_price | INTEGER |
| billing | INTEGER |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

#### daily_notes（メモ）
| 列名 | データ型 |
|---|---|
| id | BIGSERIAL |
| date | DATE |
| note | TEXT |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

#### client_users（クライアントユーザー）
| 列名 | データ型 |
|---|---|
| id | UUID |
| username | TEXT |
| password_hash | TEXT |
| display_name | TEXT |
| is_active | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

#### client_permissions（クライアント権限）
| 列名 | データ型 |
|---|---|
| id | BIGSERIAL |
| user_id | UUID |
| page | TEXT |
| created_at | TIMESTAMPTZ |

### 2-4. APIキーの確認

「Project Setting」→「Data API」から以下を控える：
- `Project URL`（例: `https://XXXXXXXXXX.supabase.co`）
   - [「Project Setting」](https://gyazo.com/de66801f0c69ad51fd0ea7199f8ede35)
   - [「Data API」](https://gyazo.com/2b7a86d35d083ef90f56c746ce5454cd)

「Project Setting」→「API Keys」→「Legacy anon, service_role API keys」タブから以下を控える：
- `service_role` キー
   - [「Project Setting」](https://gyazo.com/de66801f0c69ad51fd0ea7199f8ede35)
   - [「API Keys」→「Legacy anon, service_role API keys」タブ](https://gyazo.com/546eb7f119768f532cd6bbb0d41580f9)

---

## ③ Vercelへのデプロイ

### 3-1. GitHubリポジトリの準備

1. [github.com/nishihara721/report-dashboard](https://github.com/nishihara721/report-dashboard) をフォーク
   またはリポジトリをクローンして新しいリポジトリにpush

### 3-2. Vercelでプロジェクトを作成

1. [vercel.com](https://vercel.com) にアクセス
2. 「Add New Project」→ GitHubリポジトリを選択して「Import」
3. [「Environment Variables」](https://gyazo.com/a428cf9184650f55a24d8c94e476538c)に以下を[全て入力](https://gyazo.com/2ae2830eea7245d4a18cff85db125f6b)してからデプロイ：

| 変数名 | 値 | 説明 |
|---|---|---|
| `GOOGLE_SHEETS_ID` | スプレッドシートのID | URLの `/d/` と `/edit` の間の文字列 |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | サービスアカウントのメール | ①-1で取得した`client_email` の値 |
| `GOOGLE_PRIVATE_KEY` | 秘密鍵 | ①-1で取得した`private_key` の値（改行含む） |
| `NEXTAUTH_URL` | デプロイ後のVercel URL | 例: `https://xxxx.vercel.app` |
| `NEXTAUTH_SECRET` | ランダムな文字列 | 任意の長い文字列 |
| `GOOGLE_CLIENT_ID` | OAuthクライアントID | ①-2で取得 |
| `GOOGLE_CLIENT_SECRET` | OAuthクライアントシークレット | ①-2で取得 |
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseのProject URL | ②-4で取得 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabaseのservice_roleキー | ②-4で取得 |
| `SYNC_SECRET` | 任意のランダムな文字列 | GASとの認証用（例: `sync_secret_XXXXX`） |
| `CL_SOURCE` | `flipdesk` または `clicklog` | CL数のデータソース（省略時は `flipdesk`） |
| `NEXT_PUBLIC_ENABLE_SHARED_REPORT` | `true` または `false` | 期間別(共有用)ページの表示/非表示（省略時は非表示） |

4. [デプロイ](https://gyazo.com/1959e6b2db707aeef8ee8efc5294f772)完了後、表示されたURLを控える

### 3-3. OAuthリダイレクトURIの追加

Google Cloud Consoleに戻り、OAuthクライアントIDの承認済みリダイレクトURIに追加：
```
https://あなたのVercelURL/api/auth/callback/google
```

### 3-4. WebhookをGitHubに手動登録

1. GitHubのリポジトリ→「Settings」→「Webhooks」→「Add webhook」
2. 以下を入力：
   - Payload URL: Vercelダッシュボードの「Settings」→「Git」で確認
   - Content type: `application/json`
   - Which events: `Just the push event`

---

## ④ スプレッドシートの準備

### 必要なシート構成

以下のシートを用意してください。**列名は必ず以下の通りにしてください。**

---

#### 【データ】セッション数
- ヘッダーが **4行目** にある
- 必須列：

| 列名 | 説明 |
|---|---|
| `日付` | 日付（例: 2026/03/18） |
| `合計` | PV数の合計 |
| `訴求名` | 訴求別のPV数（訴求ごとに列を追加） |

- 訴求別のPV数は訴求名をそのまま列名にして追加する
- 訴求として扱わない列はGASの `excludeColumns` に追加して除外する

---

#### 【データ】フリップデスク
- ヘッダーが **1行目** にある
- 必須列：

| 列名 | 説明 |
|---|---|
| `日付` | 日付 |
| `自動ポップアップ表示回数` | imp数 |
| `ポップアップ内のクリック数` | CL数（`CL_SOURCE=flipdesk` の場合） |
| `p` | ポップアップの識別値（例: p01） |
| `s` | シナリオの識別値（例: s01） |
| `離脱地点` | 離脱地点の識別値（例: LP離脱） |
| `訴求` | 訴求の識別値 |

---

#### 【データ】友だちデータ
- ヘッダーが **1行目** にある
- 必須列：

| 列名 | 説明 |
|---|---|
| `友だち追加日時` | 日時（例: 2026/3/18 16:38） |
| `p` | ポップアップの識別値 |
| `s` | シナリオの識別値 |
| `離脱地点` | 離脱地点の識別値 |
| `訴求` | 訴求の識別値 |

---

#### 【データ】成果ログ
- ヘッダーが **1行目** にある
- 必須列：

| 列名 | 説明 |
|---|---|
| `成果日時` | 日時（例: 2026/03/18 18:52:00） |
| `p` | ポップアップの識別値 |
| `s` | シナリオの識別値 |
| `成果単価` | 1件あたりの単価（数値） |
| `訴求` | 訴求の識別値 |

---

#### 【データ】クリックログ（`CL_SOURCE=clicklog` の場合のみ）
- ヘッダーが **1行目** にある
- 必須列：

| 列名 | 説明 |
|---|---|
| `クリック日時` | 日時 |
| `CV/追加` | 種別（`LINE追加` の行をCL数としてカウント） |
| `p` | ポップアップの識別値 |
| `s` | シナリオの識別値 |
| `離脱地点` | 離脱地点の識別値 |

---

#### 【データ】基幹数値（期間別共有用を使う場合のみ）
- ヘッダーが **1行目** にある
- 列構成：

| 列 | 列名 | 説明 |
|---|---|---|
| A列 | 日付 | 日付 |
| B列 | CV数 | CV数 |
| C列 | 成果単価 | 成果単価 |
| D列 | 請求額 | 請求額 |

---

### サービスアカウントへの共有設定

スプレッドシートを開き、「共有」から、1-1で取得したclient_email（例: `xxxxx@xxxxx.iam.gserviceaccount.com`）のアドレスを **閲覧者** として追加してください。

---

## ⑤ GASの設定

### 5-1. スクリプトの設置

1. スプレッドシートのメニュー「拡張機能」→「Apps Script」を開く
2. GASのコード（`syncToSupabase` 関数）を貼り付け（GitHubのREADMEまたは開発者から入手）
3. 以下の箇所を実際の値に変更：

```javascript
const NEXT_APP_URL = 'https://あなたのVercelURL';
const SYNC_SECRET = 'Vercelに設定したSYNC_SECRETと同じ値';

// 訴求として扱わない列名のリスト（セッション数シートの訴求以外の列名を追加）
const excludeColumns = ['日付', '合計', '除外したい列名'];
```

### 5-2. 初回データ投入

1. GASの画面で `syncToSupabase` 関数を選択
2. 「実行」ボタンをクリック
3. 初回は権限の許可を求められるので「許可」をクリック
4. ログに `syncレスポンス: 200 {"success":true}` と表示されれば成功

### 5-3. 定期実行トリガーの設定

1. GASの左メニュー「トリガー」をクリック
2. 「トリガーを追加」をクリック
3. 以下を設定：
   - 実行する関数: `syncToSupabase`
   - イベントのソース: 時間主導型
   - タイプ: 時間ベースのタイマー
   - 間隔: 1時間ごと

---

## ⑥ 動作確認

1. Vercelのデプロイ先URLにアクセス
2. Googleアカウントでログイン
3. 各ページでデータが表示されることを確認
4. `/admin` ページでクライアントユーザーを作成
5. `/client/login` にアクセスしてクライアントログインを確認

---

## ユーザー管理

### 管理者がクライアントユーザーを作成する手順

1. `https://あなたのVercelURL/admin` にアクセス（`@5s-inc.jp` アカウントのみ）
2. 「ユーザーを追加」をクリック
3. クライアント名・ログインID・パスワード・閲覧可能ページを設定
4. 作成後、以下をクライアントに共有：
   - ログインURL: `https://あなたのVercelURL/client/login`
   - ログインID
   - パスワード

### 閲覧可能ページ一覧

| ページキー | ページ名 |
|---|---|
| `shared` | 期間別（共有用）※`NEXT_PUBLIC_ENABLE_SHARED_REPORT=true`の場合のみ |
| `summary` | サマリ |
| `period` | 期間別 |
| `popup` | ポップアップ別 |
| `scenario` | シナリオ別 |
| `exit` | 離脱地点別 |
| `appeal` | 訴求別 |

---

## 新しい案件を追加する場合

1. Vercelで「Add New Project」から同じGitHubリポジトリを再度インポート
2. 環境変数を案件ごとに設定（最低限以下を変更）：
   - `GOOGLE_SHEETS_ID`：新しい案件のスプレッドシートID
   - `NEXTAUTH_URL`：新しいVercelのURL
   - `NEXT_PUBLIC_ENABLE_SHARED_REPORT`：期間別(共有用)が必要な場合は `true`
3. 新しいスプレッドシートにサービスアカウントを共有
4. 新しいスプレッドシートにGASを設置して `NEXT_APP_URL` と `SYNC_SECRET` を更新
5. GitHubにWebhookを手動登録

---

## トラブルシューティング

| 症状 | 原因 | 対処法 |
|---|---|---|
| ページが表示されない | 環境変数の設定漏れ | Vercelの環境変数を確認 |
| データが表示されない | GASが未実行 | GASで `syncToSupabase` を手動実行 |
| ログインできない | OAuthのリダイレクトURI未設定 | Google Cloud ConsoleでURIを追加 |
| Vercelに自動デプロイされない | WebhookがGitHubに未登録 | GitHubのWebhooks設定を確認 |
| スプシの列名を変更した | データが取得できなくなる | GASの列名を合わせて修正 |
| 環境変数を変更してもUIが変わらない | `NEXT_PUBLIC_`変数はビルド時に埋め込まれる | Vercelで再デプロイが必要 |
| 選択肢が全件表示されない | Supabaseの1000件制限 | ビューが正しく作成されているか確認 |