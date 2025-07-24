# Chatコンポーネント データフロー設計書

## 1. 状態管理アーキテクチャ

### 状態分離戦略
```
ChatDataContext: メッセージデータ、接続状態
ChatUIContext: UI状態、送信状態  
ChatActionsContext: アクション関数群
```

### 管理する状態
- **messages**: Message[] - メッセージ一覧
- **connectionStatus**: 'connecting' | 'connected' | 'disconnected' | 'error'
- **sendingMessages**: Set<string> - 送信中メッセージID
- **unreadCount**: number - 未読メッセージ数
- **lastReadMessageId**: string | null - 最後に読んだメッセージID
- **isTabActive**: boolean - タブアクティブ状態
- **scrollToMessageId**: string | null - スクロール対象メッセージID
- **isLoading**: boolean - 履歴読み込み中状態
- **hasMore**: boolean - 追加読み込み可能フラグ

## 2. 詳細データフロー

### 2.1 送信フロー

#### 正常系
1. **MessageInput**: ユーザーがテキスト入力・送信ボタン押下
2. **バリデーション**: 空メッセージチェック、文字数制限
3. **状態更新**: 送信中状態を追加（sendingMessages Set）
4. **一意ID生成**: クライアントサイドでtempId生成
5. **Ably送信**: channel.publish()でメッセージ送信
6. **送信完了**: sendingMessages Setから削除
7. **UI更新**: 送信ボタン有効化、入力フィールドクリア

#### エラー系
- **送信失敗**: リトライ機能（最大3回）
- **接続断**: 未送信キューに保存、再接続時に送信
- **タイムアウト**: 送信状態リセット、エラー表示

### 2.2 受信フロー

#### リアルタイム受信
1. **Ably受信**: channel.subscribe()でメッセージ受信
2. **重複チェック**: messageId based で重複排除
3. **状態更新**: messages配列に追加（時系列順）
4. **未読管理**: タブ非アクティブ時は unreadCount++
5. **通知発火**: onNewMessage コールバック実行
6. **UI更新**: MessageList の自動更新

#### タブ状態連携
- **アクティブ時**: 未読数を0にリセット
- **非アクティブ時**: 未読数を増加、通知発火

### 2.3 履歴読み込みフロー

#### 初期読み込み（Client-side API）
1. **Chat初期化**: roomIdでAblyチャンネル参加
2. **API呼び出し**: GET /api/chat/history?roomId=xxx&limit=50
3. **状態初期化**: 取得メッセージでmessages配列初期化
4. **UI表示**: MessageListで履歴表示
5. **接続完了**: connectionStatus = 'connected'

#### 追加読み込み（無限スクロール）
1. **スクロール検知**: MessageList上端到達
2. **API呼び出し**: 最古メッセージより前を取得
3. **状態更新**: messages配列の先頭に追加
4. **スクロール位置保持**: 読み込み前の位置を維持

## 3. 競合状態とエラーハンドリング

### 重複メッセージ防止
- **messageId**: サーバーサイドで一意ID生成
- **重複チェック**: 受信時にmessageIdで重複排除
- **送信中管理**: tempIdとmessageIdのマッピング

### 接続管理
- **自動再接続**: Ably接続断時の自動復旧
- **未送信キュー**: 接続断時のメッセージ保持
- **状態同期**: 再接続時の状態整合性確保

### エラー処理
- **送信エラー**: リトライ機能、最大試行回数制限
- **API エラー**: 適切なエラーメッセージ表示
- **ネットワークエラー**: オフライン状態の検知・表示

## 4. パフォーマンス最適化

### Context分離による最適化
- **データContext**: メッセージデータの変更時のみ更新
- **UIContext**: UI状態の変更時のみ更新
- **ActionsContext**: 静的なため再レンダリング不要

### 大量メッセージ対応
- **仮想化**: react-window等による仮想スクロール
- **メモリ管理**: 表示外メッセージの適切な管理
- **ページング**: 適切な件数での履歴取得

### 状態更新の最適化
- **useReducer**: 複雑な状態更新ロジック
- **useMemo**: 計算コストの高い値のメモ化
- **useCallback**: イベントハンドラーの最適化

## 5. 外部API設計

### 提供する制御関数
- **scrollToMessage(messageId)**: 特定メッセージへのスクロール
- **markAsRead()**: 未読状態のリセット
- **resendMessage(messageId)**: 失敗メッセージの再送信

### コールバック関数
- **onNewMessage(message, isTabActive)**: 新着メッセージ通知
- **onUnreadCountChange(count, reason)**: 未読数変更通知
- **onConnectionChange(status)**: 接続状態変更通知

## 6. 初期化フロー

### コンポーネント初期化
1. **Props検証**: 必須プロパティのチェック
2. **Ably設定**: 接続設定の初期化
3. **API設定**: エンドポイント設定
4. **チャンネル参加**: roomIdベースのチャンネル購読
5. **履歴取得**: 初期メッセージの読み込み
6. **UI初期化**: 各サブコンポーネントの準備完了

### roomId変更時
1. **前チャンネル離脱**: 既存チャンネルのunsubscribe
2. **状態リセット**: メッセージ・未読数等のクリア
3. **新チャンネル参加**: 新roomIdでのチャンネル購読
4. **履歴再取得**: 新ルームの履歴読み込み

---
*作成日: 2025-07-24*
*ステータス: 設計完了*