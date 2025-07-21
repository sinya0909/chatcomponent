import ChatContainer from "./components/chat/ChatContainer";

export default function Page() {
  return (
	<div>
	  <ChatContainer  
	   chatRoom={{ id: '1', name: 'General' }}
	  />
	</div>
  );
}