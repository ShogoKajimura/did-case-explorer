# DID症例文献コンパニオンリソース

## 学内確認用説明資料

作成日: 2026-04-09  
作成者: 梶村昇吾  
対象プロジェクト: DID/MPD多言語症例報告レビュー、制限付きOCR支援、公開可能なエビデンスマップ型コンパニオンサイト

## 1. 目的

本資料は、DID症例文献コンパニオンリソースの現在のシステム構成と運用方法を、学内の事務・研究推進・知財・情報セキュリティ等の確認用に要約したものです。

本プロジェクトには、相互に関連しつつも意図的に分離された2つの機能があります。

1. 公開可能な書誌情報・コード化変数・図表・凍結済みスナップショットを表示する公開ウェブサイト
2. 外部協力者からPDFを受け付け、OCR処理を行い、後続のレビュー研究に活用する制限付き投稿・OCRワークフロー

本サービスの想定用途は以下です。

- DID/MPD症例文献の多言語エビデンスマップ作成
- スキャン文献や入手困難文献のOCR処理
- DID関連文献のレビュー・統合的整理
- 将来的なメタ分析または構造化レビュー更新の支援

一方で、本サービスは、著作権のあるフルテキストPDFを公開配布することを目的としていません。

## 2. 現在の公開URLと配置

### 公開サイト

- 公開explorerトップ:
  - `https://shogokajimura.github.io/did-case-explorer/`
- 投稿ページ:
  - `https://shogokajimura.github.io/did-case-explorer/submit.html`
- status確認ページ:
  - `https://shogokajimura.github.io/did-case-explorer/status.html`

### 制限付きバックエンド

- OCRバックエンド設置先:
  - 研究代表者が管理するローカルMac
- 外部公開方式:
  - Tailscale Funnel
- 現在のバックエンドURL:
  - `https://shogomac-studio.taila49884.ts.net/`

この制限付きバックエンドは、一般公開された文献リポジトリではありません。投稿ワークフロー経由のアップロードのみを受け付け、アップロード者本人に対してのみ、トークン付きstatusリンクを通じて処理状況とOCR生成物を返します。

## 3. システム全体構造

### 公開層

- ホスト: GitHub Pages
- ファイル種別: 静的HTML、CSS、JavaScript、JSON、TSV、各種説明文書
- 主な機能:
  - 公開可能なメタデータの閲覧
  - 公開可能な図表・集計値の表示
  - 凍結済みスナップショットの配布
  - 投稿フォームUI
  - private statusページUI

### 制限付きバックエンド層

- ホスト: ローカルMac
- API: FastAPI
- OCRランタイム:
  - Tesseract
  - pdftoppm / poppler
  - pdfunite
- 実行構成:
  - ローカルAPIプロセス
  - ローカルworkerプロセス
  - launchdによる自動再起動

### 外部接続層

- Tailscale Funnel により、制限付きAPIのみを HTTPS で外部公開
- Cloudflare Turnstile により、投稿フォームへの bot 投稿を抑制

## 4. データフロー

### 公開スナップショット側の流れ

1. 文献メタデータとコード化変数をローカルで整理する
2. 公開可能な凍結版エクスポートを生成する
3. 静的explorerを更新し、GitHub Pagesへ反映する
4. 利用者は公開可能な出力のみを閲覧する

### 制限付き投稿・OCR側の流れ

1. 外部利用者が公開投稿ページを開く
2. 利用者がPDFを1本アップロードし、適法なアクセス権があることを確認する
3. Cloudflare Turnstile が human verification を行う
4. ブラウザはPDFを制限付きバックエンドへ送信する
5. バックエンドは job record を作成し、PDFをローカル保存する
6. バックエンドは private status link と access token を返す
7. ローカルworker が OCR 処理を実行する
8. worker は以下を生成する
   - `searchable.pdf`
   - `canonical.txt`
9. worker は OCR テキストと入力メタデータを用いて DID 関連性スクリーニングを行う
10. 明確に DID 関連または関連可能性が高い場合は、private status page からダウンロード可能になる
11. DID と無関係に見える場合は、ダウンロードを一時保留し、書誌情報の補足を求める
12. 後日の監査を経て初めて、その文献メタデータを将来の公開コーパス更新に含める

## 5. 公開データと非公開データの境界

### 公開対象

- 公開可能と判断された書誌メタデータ
- 公開可能と判断された臨床変数のコード
- source-access status
- パブリックドメインまたは法的に明確な公開リンク
- 集計図表と公開スナップショット配布ファイル
- 本人が明示的に入力した場合に限る contributor 名

### 非公開対象

- アップロードされたPDF原本
- 著作権のあるソースファイル
- 制限付き文書に対する OCR 生成物
- 本人が公開意思を示していない contributor 識別情報
- submitter のメールアドレス・所属情報
- queue 状態および内部監査メモ
- ローカルファイルパス

## 6. 投稿制御とアクセス制御

### 実装済みの制御

- PDF 形式のみ受け付け
- PDF シグネチャ確認
- 適法アクセス確認チェックボックス
- honeypot フィールド
- クライアント単位の rate limit
- Cloudflare Turnstile による bot 対策
- トークン付き private status link
- アップロードファイルの公開一覧化なし
- 制限付き OCR 生成物の公開閲覧なし
- status / artifact endpoint への `Cache-Control: no-store`

### 現在の関連性スクリーニング

OCR 完了後に、システムは DID/MPD 関連語に基づくスクリーニングを行います。

現在の判定状態:

- `likely_relevant`
- `possible_relevant`
- `needs_information`

ファイルが DID/MPD 文献と無関係に見える場合でも、現時点では自動で即時削除していません。代わりに、

- ダウンロードを保留
- status page で書誌情報の追加入力を求める
- 後続の手動または半自動レビューで保持・除外を判断する

という方針です。これは、非英語文献や古いスキャン文献で false negative が出ることを避けるためです。

## 7. OCR 品質と使用言語

OCR パイプラインは、最大速度よりも品質を優先して設計しています。

### 現在の品質確保方針

- PDF のページ画像化
- searchable PDF の生成
- canonical text の抽出
- 利用者が言語指定をしない場合の script-aware 自動言語選択

例:

- Hebrew 主体文書は `heb+eng` を優先
- Japanese 主体文書は `jpn+eng` を優先
- Korean 主体文書は `kor+eng` を優先
- 漢字系文書は中国語＋英語系の候補へ振り分け

この設計は、汎用の多言語デフォルトでは一部の非ラテン文字文書で OCR 品質が低下したため導入しました。

### 現在の処理方式

- queue の安定性を優先して worker は 1 本で運用
- private status page で queue position と jobs ahead を表示
- 将来的には安全な並列 worker へ拡張可能だが、現状は出力品質と信頼性を優先

## 8. ローカルランタイムと保存

### バックエンド実行方式

- API: FastAPI + uvicorn
- worker: ローカル Python worker
- 監視・再起動: launchd
- 外部公開: Tailscale Funnel

### 現在の稼働前提

以下の条件が満たされる間、サービスは利用可能です。

- Mac が起動している
- ユーザーがログイン状態である
- launchd agent が動いている
- Tailscale Funnel が有効である

### 現在の保存場所

- project lead のユーザーアカウント配下の local application support directory
- job record、アップロードPDF、OCR生成物はそのローカルマシンに保存

## 9. バージョン管理と公開ルール

公開explorerは、論文またはレビューの freeze を単位としてバージョン管理しています。

現在の公開モデル:

- 公開explorer は `2026-03-27` の manuscript-aligned snapshot を反映
- 新規投稿は post-freeze contribution として扱う
- post-freeze contribution は自動では public dataset に入らない
- 将来の公開更新には、メタデータ確認と法的確認が必要

この分離は、再現性確保と法的境界管理のために重要です。

## 10. 大学に確認したい法的・倫理的論点

以下の点について、大学としての整理が必要です。

### 著作権・知財

- 外部投稿されたPDFを制限付きでOCR処理する運用が、この研究目的に照らして許容されるか
- OCR 後の searchable PDF 等を投稿者本人に返す運用が許容されるか
- 利用規約、注意書き、削除依頼窓口等が追加で必要か

### 個人情報

- 投稿者の氏名・メールアドレス・所属を現在の方式で取得してよいか
- 必要な privacy notice や retention statement は何か
- contributor 名とリンクの公開について、現在の opt-in 方式で十分か

### 研究コンプライアンス

- 本サービスが通常の文献レビュー基盤の範囲でよいか、別途の学内審査が必要か
- 外部からファイル提供と識別情報取得を伴うことにより、倫理審査や研究審査の対象になるか

### 情報基盤・運用

- 大学所属のローカルマシンを restricted backend として用いてよいか
- Tailscale Funnel による外部公開を許容できるか
- 必要なセキュリティ基準、ログ保存、インシデント対応手順があるか

## 11. 現時点の限界

- restricted backend は大学管理インフラではなく、現時点ではローカル Mac 上で稼働している
- 長期保存期間や削除ルールはまだ完全には正式化していない
- 関連性スクリーニングは保守的だが完全ではない
- 現時点では小規模利用を想定した運用であり、完全な大学管理サービスではない

## 12. 今後の改善予定

- 正式な利用規約とプライバシー通知の整備
- 保存期間・削除方針の明文化
- manuscript-freeze records と後続追加文献を区別する release log の整備
- 利用量増加時の安全な multi-worker 化
- 必要に応じた managed infrastructure への移行

## 13. 事務向け要約

平易に言うと、現在のシステムは以下のように動いています。

- 公開ウェブサイトは GitHub Pages 上の静的サイト
- 利用者はそのサイト上から PDF を投稿できる
- PDF 自体は GitHub Pages に保存されない
- PDF はローカルマシン上の restricted backend に送られる
- ローカルマシンが OCR を実行し、ダウンロード用ファイルを作る
- アップロード者は token 付き private status link を通じてのみ結果にアクセスする
- public release は、確認済みのメタデータと集計出力に限る

したがって、大学として確認すべき論点は、公開サイトそのものだけではなく、以下にも及びます。

- 投稿 PDF の OCR 処理
- OCR 生成物の投稿者返却
- 投稿者情報の取得
- インターネットに公開された restricted backend の運用

