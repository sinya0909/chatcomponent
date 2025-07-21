import ChatContainer from "./components/chat/ChatContainer";
import UserList from "./components/db/UserList";

export default function Page() {
	return (
		<div>
			<ChatContainer
				chatRoom={{ id: '1', name: 'General' }}
			/>
			<UserList />
		</div>
	);
}