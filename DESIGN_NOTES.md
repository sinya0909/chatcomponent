# Chatコンポーネント設計議事録

## 設計会議 - 基本方針決定

### 1. 基本要件
- **認証機能**: 不要（外部で管理）
- **対象**: 複数人数のチャットルーム
- **通信**: Ably を使用したリアルタイム通信
- **フレームワーク**: Next.js 15 + TypeScript

### 2. データ受け渡し方法の検討

#### 検討したパターン
1. **Props経由**: 明示的だが Props Drilling の問題
2. **Context継承**: Props Drilling解決だが結合度が高い
3. **Children継承**: 柔軟性と独立性を両立

#### 決定事項
- **Children継承（Compound Components）を採用**
- 理由:
  - Props Drilling を回避
  - 結合度が低く、テストしやすい
  - コンポーネントの独立性を保持
  - 段階的な複雑化に対応可能

### 3. コンポーネント構造

#### 基本使用例
```typescript
<Chat ablyConfig={config} roomId="general">
  <Chat.MessageList />
  <Chat.MessageInput currentUser={user} />
</Chat>
```

#### カスタマイズ例
```typescript
<Chat ablyConfig={config} roomId="general">
  <CustomHeader />
  <Chat.MessageList 
    renderMessage={CustomMessage}
    showTimestamp={true}
  />
  <Chat.TypingIndicator />
  <Chat.MessageInput 
    currentUser={user}
    placeholder="メッセージを入力..."
  />
</Chat>
```

#### コンポーネント階層
- `Chat` - ルートコンポーネント（Ably接続・ルーム管理）
- `Chat.MessageList` - メッセージ一覧表示
- `Chat.MessageInput` - メッセージ入力
- `Chat.TypingIndicator` - タイピング表示
- `Chat.OnlineUsers` - オンラインユーザー一覧

### 4. スコープの明確化

#### 検討したスコープ
- **パターンA**: チャットアプリ全体（ルーム選択含む）
- **パターンB**: 単一チャットルーム（特定ルームのみ）
- **パターンC**: 複数パターン対応

#### 決定事項
- **パターンB（単一チャットルーム）を採用**
- 理由:
  - コンポーネントの責務が明確
  - 再利用性が高い
  - ルーム選択機能は別コンポーネントとして分離可能

### 5. 次のステップ
1. 各サブコンポーネントの詳細機能要件定義
2. 状態管理とデータフローの設計
3. TypeScript型定義の設計
4. 実装の詳細設計

---
*作成日: 2025-07-24*