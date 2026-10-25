import Chat from "../components/Chat"
import { useChat } from "../hooks/useChat"
import "../style/chat.scss"

const ChatPage = () => {
    const chat = useChat()
    return <Chat {...chat} />
}

export default ChatPage
