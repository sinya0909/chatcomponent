"use client";
import { useState, useEffect } from 'react';

type ChatRoom = {
	id: string;
	name: string;
}

type Message = {
	id: number;
	chatRoomId: string;
	message: string;
	userId: string;
	userName: string;
	timestamp: string;
};

type User = {
	id: string;
	name: string;
};

export default function ChatContainer({ chatRoom }: { chatRoom: ChatRoom }) {
	// state 管理
	const [messages, setMessages] = useState<Message[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [currentUserId, setCurrentUserId] = useState<string>(''); // 追加

	// ユーザーの追加
	const joinChat = (user: User) => {
		
		const systemMessage: Message = {
			chatRoomId: chatRoom.id,
			id: Date.now(), // 一意のIDを生成
			message: `${user.name}さんが参加しました`,
			userId: user.id,
			userName: 'System',
			timestamp: new Date().toISOString(),
		};

		// システムメッセージを追加
		setMessages(prevMessages => [...prevMessages, systemMessage]);
		
		setUsers(newUser => {
			// 新しいユーザーを追加
			return [...newUser, user];
		});

		// 現在のユーザーが未設定なら設定
		if (!currentUserId) {
			setCurrentUserId(user.id);
		}
	};


	// ユーザー退出
	const leaveChat = (user: User) => {
		
		const systemMessage: Message = {
			chatRoomId: chatRoom.id,
			id: Date.now(), // 一意のIDを生成
			message: `${user.name}さんが退出しました`,
			userId: user.id,
			userName: 'System',
			timestamp: new Date().toISOString(),
		};

		// システムメッセージを追加
		setMessages(prevMessages => [...prevMessages, systemMessage]);
		
		setUsers(prevUsers => {
			// ユーザーを削除
			return prevUsers.filter(u => u.id !== user.id);
		});
	};

	function addMessage(user: User, message_id: number, text: string) {
		
		const message: Message = {
			chatRoomId: chatRoom.id,
			id: message_id,
			message: text,
			userId: user.id,
			userName: user.name,
			timestamp: new Date().toISOString(),
		};

		setMessages(prevMessages => {
			// 新しいメッセージを追加
			return [...prevMessages, message];
		});
	}

	const sendMessage = (text: string) => {
      // 入力チェック
		if (!text.trim()) {
			alert('メッセージを入力してください');
			return;
		}

		// ユーザーチェック
		const currentUser = users.find(u => u.id === currentUserId);
		if (!currentUser) {
			alert('先にチャットに参加してください');
			return;
		}

		// addMessageを呼び出し
		addMessage(currentUser, Date.now(), text.trim());
	};

	return (
		<div className="chat-container">
			<h1>{chatRoom.name}</h1>
			<div>
				<button onClick={() => joinChat({ id: '1', name: 'Alice' })}>Join as Alice</button>
				<button onClick={() => joinChat({ id: '2', name: 'Bob' })}>Join as Bob</button>
				<button onClick={() => leaveChat({ id: '3', name: 'Charlie' })}>Leave as Charlie</button>
			</div>

			<div className="user-list">
				<h2>Users</h2>
				<ul>
					{users.map(user => (
						<li key={user.id}>
							{user.name}
							<button onClick={() => leaveChat(user)}>
								Leave
							</button>
						</li>
					))}
				</ul>
			</div>

			<div className="message-list">
				<h2>Messages</h2>
				<ul>
					{messages.map(message => (
						<li key={message.id}>
							<strong>{message.userName}</strong>: {message.message}
						</li>
					))}
				</ul>
			</div>
			<div className="send-message">
				<input
					type="text"
					placeholder="Type a message"
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							sendMessage((e.target as HTMLInputElement).value);
							(e.target as HTMLInputElement).value = ''; // 入力フィールドをクリア
						}
					}}
				/>
			</div>
		</div>
	);
}


