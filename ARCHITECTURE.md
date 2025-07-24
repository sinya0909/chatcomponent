# Chatコンポーネント アーキテクチャ設計書

## アーキテクチャ概要

### マイクロサービス + ワークスペース構成
```
chatcomponent/                  # ルートプロジェクト（monorepo）
├── packages/                   # マイクロサービス群
│   ├── chat-service/          # チャット機能サービス
│   ├── auth-service/          # 認証機能サービス
│   └── main-app/              # メインアプリケーション
├── shared/                    # 共通リソース
│   ├── types/                 # 共通型定義
│   └── docs/                  # 設計ドキュメント
├── package.json               # ワークスペース管理
└── pnpm-workspace.yaml        # pnpm設定（推奨）
```

## サービス詳細設計

### 1. Chat Service (@chatcomponent/chat-service)

#### 責務
- チャット機能の提供
- リアルタイムメッセージング
- メッセージ履歴管理
- 通知イベントの発火

#### ディレクトリ構成
```
packages/chat-service/
├── src/
│   ├── components/           # Reactコンポーネント
│   │   ├── Chat.tsx         # ルートコンポーネント
│   │   ├── MessageList.tsx  # メッセージ一覧
│   │   ├── MessageInput.tsx # メッセージ入力
│   │   ├── TypingIndicator.tsx
│   │   ├── OnlineUsers.tsx
│   │   ├── ChatContext.tsx  # 状態管理Context
│   │   └── index.ts         # 統一エクスポート
│   ├── hooks/               # カスタムフック
│   │   ├── useChatState.ts
│   │   ├── useAblyConnection.ts
│   │   └── useNotification.ts
│   ├── lib/                 # ユーティリティ
│   │   ├── ably.ts         # Ably設定
│   │   ├── api.ts          # API通信
│   │   └── utils.ts
│   ├── types/               # 型定義
│   │   └── chat.ts
│   └── api/                 # Next.js API Routes
│       ├── history/
│       │   └── route.ts
│       └── send/
│           └── route.ts
├── package.json
├── tsconfig.json
└── README.md
```

#### エクスポート
```typescript
// packages/chat-service/src/index.ts
export { Chat } from './components/Chat';
export { MessageList } from './components/MessageList';
export { MessageInput } from './components/MessageInput';
export type { ChatProps, Message, User } from './types/chat';
```

### 2. Auth Service (@chatcomponent/auth-service)

#### 責務
- 認証機能の提供
- モック認証の実装
- セッション管理
- ユーザー情報管理

#### ディレクトリ構成
```
packages/auth-service/
├── src/
│   ├── components/
│   │   ├── MockAuth.tsx     # モック認証プロバイダー
│   │   ├── LoginForm.tsx    # ログインフォーム
│   │   ├── AuthContext.tsx  # 認証状態管理
│   │   └── index.ts
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── lib/
│   │   ├── auth.ts         # 認証ロジック
│   │   └── session.ts      # セッション管理
│   ├── types/
│   │   └── auth.ts
│   └── api/
│       ├── login/
│       │   └── route.ts
│       ├── logout/
│       │   └── route.ts
│       └── me/
│           └── route.ts
├── package.json
├── tsconfig.json
└── README.md
```

### 3. Main App (@chatcomponent/main-app)

#### 責務
- アプリケーションの統合
- ルーティング管理
- レイアウト提供
- デモページの実装

#### ディレクトリ構成
```
packages/main-app/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx        # ホームページ
│   │   ├── demo/           # デモページ
│   │   │   └── page.tsx
│   │   └── api/            # プロキシAPI（必要時）
│   │       └── proxy/
│   └── components/
│       └── layout/         # レイアウト用コンポーネント
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## ワークスペース設定

### ルートpackage.json
```json
{
  "name": "chatcomponent",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "packageManager": "pnpm@8.0.0",
  "scripts": {
    "dev": "pnpm --parallel --filter main-app dev",
    "build": "pnpm --recursive build",
    "test": "pnpm --recursive test",
    "lint": "pnpm --recursive lint"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### パッケージ依存関係
```json
// packages/main-app/package.json
{
  "name": "@chatcomponent/main-app",
  "dependencies": {
    "@chatcomponent/chat-service": "workspace:*",
    "@chatcomponent/auth-service": "workspace:*",
    "next": "15.0.0",
    "react": "^18.0.0"
  }
}
```

## サービス間通信

### パターン1: 直接インポート（推奨）
```typescript
// packages/main-app/src/app/demo/page.tsx
import { Chat } from '@chatcomponent/chat-service';
import { useAuth } from '@chatcomponent/auth-service';

export default function DemoPage() {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <Chat 
      roomId="demo-room"
      currentUser={user}
      apiConfig={{ baseUrl: "/api/chat" }}
    >
      <Chat.MessageList />
      <Chat.MessageInput />
    </Chat>
  );
}
```

### API統合
- Chat Service のAPI Routes は Main App から利用
- 認証チェックは Auth Service の機能を活用
- 各サービスは独立してテスト可能

## 開発・ビルド・デプロイ

### 開発コマンド
```bash
# 全体の依存関係インストール
pnpm install

# 開発サーバー起動（main-appのみ）
pnpm dev

# 特定パッケージでの開発
pnpm --filter chat-service dev

# 全パッケージビルド
pnpm build
```

### デプロイ戦略
- **Vercel**: main-app を単一アプリとしてデプロイ
- **パッケージ統合**: ビルド時に全サービスを統合
- **環境変数**: 三サービス共通の設定管理

## 利点・特徴

### 利点
- **責務分離**: 各サービスの役割が明確
- **独立開発**: サービス毎の並行開発が可能
- **再利用性**: 他プロジェクトでの個別利用が容易
- **テスト容易性**: サービス単位でのテストが可能
- **型安全性**: TypeScriptによる型共有

### モノリスとの比較
- **複雑性**: 適度な複雑性の増加
- **開発体験**: ディレクトリ構成の見通しが良い
- **スケーラビリティ**: 将来的な機能追加が容易

---
*作成日: 2025-07-24*
*アーキテクチャ: マイクロサービス + ワークスペース*