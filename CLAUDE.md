# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このプロジェクトはNext.js 15を使用してリアルタイムチャット機能を構築するTypeScriptプロジェクトです。

### 使用技術スタック
- **フロントエンド**: Next.js 15 (App Router) + TypeScript
- **リアルタイム通信**: Ably（WebSocket/Server-Sent Events）
- **データベース**: Prisma ORM
- **デプロイ**: Vercel
- **スタイリング**: CSS Modules or Tailwind CSS（設定予定）

## 基本的なコマンド

### 開発・ビルド
- `npm run dev` - 開発サーバーを起動（http://localhost:3000）
- `npm run build` - プロダクション用にビルド
- `npm run start` - プロダクションサーバーを起動
- `npm run lint` - ESLintによるコードチェック

### 依存関係管理
- `npm install` - 依存関係をインストール
- 主要な追加パッケージ（予定）:
  - `ably` - リアルタイム通信
  - `@prisma/client` + `prisma` - データベースORM
  - スタイリングライブラリ

### データベース（Prisma）
- `npx prisma generate` - Prismaクライアント生成
- `npx prisma db push` - スキーマをデータベースに適用
- `npx prisma studio` - データベースGUI

## アーキテクチャ

### チャット機能の構成
```
src/
  app/
    chat/             # チャット関連ページ
    api/              # API Routes
      chat/           # チャット関連API
  components/
    chat/             # チャット関連コンポーネント
      ChatRoom.tsx    # チャットルーム
      MessageList.tsx # メッセージ一覧
      MessageInput.tsx # メッセージ入力
  lib/
    ably.ts           # Ably設定
    prisma.ts         # Prisma設定
  types/
    chat.ts           # チャット関連の型定義
```

### リアルタイム通信（Ably）
- チャンネルベースのリアルタイム通信
- メッセージの送受信
- オンラインステータス管理
- 接続状態の管理

### データベース設計（Prisma）
- User（ユーザー）
- ChatRoom（チャットルーム）
- Message（メッセージ）
- RoomMember（ルームメンバー）

### Next.js App Router設定
- ファイルベースルーティング
- Server Components & Client Components適切な使い分け
- API Routes for サーバーサイド処理

## 開発時の注意点

### リアルタイム通信
- Ablyのチャンネル管理を適切に行う
- 接続/切断の処理を確実に実装
- エラーハンドリングとリトライ機構

### データベース
- Prismaスキーマの変更時は必ずマイグレーション
- リレーションの整合性を保つ
- パフォーマンスを考慮したクエリ設計

### セキュリティ
- メッセージの検証・サニタイゼーション
- 認証・認可の実装
- レート制限の実装

### パフォーマンス
- メッセージの仮想化（大量メッセージ対応）
- 適切なキャッシュ戦略
- 画像・ファイル最適化

## デプロイ（Vercel）
- 環境変数の設定（Ably API Key、Database URL等）
- Edge Functions活用の検討
- 本番環境でのWebSocket接続確認