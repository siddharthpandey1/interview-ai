import { useEffect, useRef, useState } from "react"

const SUGGESTIONS = [
    "Mere resume ke liye interview questions do",
    "Mujhe system design samjhao",
    "Is interview question ka behtar jawab kya hoga?",
    "Mere liye ek preparation plan banao"
]

const Chat = ({
    chats,
    messages,
    activeChatId,
    loading,
    listLoading,
    sending,
    error,
    notice,
    selectChat,
    startNewChat,
    sendMessage,
    removeChat
}) => {
    const [draft, setDraft] = useState("")
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [ messages.length, sending ])

    const submitMessage = async (value = draft) => {
        const message = value.trim()
        if (!message || sending || loading) {
            return
        }

        const sent = await sendMessage(message)
        if (sent) {
            setDraft("")
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        submitMessage()
    }

    const handleNewChat = () => {
        startNewChat()
        setDraft("")
        setSidebarOpen(false)
    }

    const handleSelectChat = (chatId) => {
        selectChat(chatId)
        setDraft("")
        setSidebarOpen(false)
    }

    const handleDeleteChat = async (event, chatId) => {
        event.stopPropagation()
        await removeChat(chatId)
    }

    return (
        <main className={`chat-page ${sidebarOpen ? "chat-page--sidebar-open" : ""}`}>
            <aside className="chat-sidebar" aria-label="Chat history">
                <div className="chat-sidebar__top">
                    <h1>AI Chat</h1>
                    <button className="chat-sidebar__new" onClick={handleNewChat} type="button">
                        <span aria-hidden="true">+</span>
                        New chat
                    </button>
                </div>
                <div className="chat-sidebar__list">
                    <p className="chat-sidebar__label">Recent</p>
                    {listLoading && <p className="chat-sidebar__status">Loading chats...</p>}
                    {!listLoading && chats.length === 0 && (
                        <p className="chat-sidebar__status">Your conversations will appear here.</p>
                    )}
                    {chats.map(chat => (
                        <div
                            className={`chat-sidebar__item ${chat._id === activeChatId ? "chat-sidebar__item--active" : ""}`}
                            key={chat._id}
                        >
                            <button
                                className="chat-sidebar__select"
                                onClick={() => handleSelectChat(chat._id)}
                                title={chat.title}
                                type="button"
                            >
                                {chat.title || "New chat"}
                            </button>
                            <button
                                aria-label={`Delete ${chat.title || "chat"}`}
                                className="chat-sidebar__delete"
                                onClick={(event) => handleDeleteChat(event, chat._id)}
                                type="button"
                            >
                                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18" />
                                    <path d="M8 6V4h8v2" />
                                    <path d="m19 6-1 14H6L5 6" />
                                    <path d="M10 11v5M14 11v5" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </aside>

            {sidebarOpen && (
                <button
                    aria-label="Close chat history"
                    className="chat-page__scrim"
                    onClick={() => setSidebarOpen(false)}
                    type="button"
                />
            )}

            <section className="chat-main" aria-label="AI conversation">
                <header className="chat-main__header">
                    <button
                        aria-label="Toggle chat history"
                        className="chat-main__menu"
                        onClick={() => setSidebarOpen(open => !open)}
                        type="button"
                    >
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h2>{chats.find(chat => chat._id === activeChatId)?.title || "AI Chat"}</h2>
                </header>

                <div className={`chat-conversation ${messages.length === 0 && !loading && !sending ? "chat-conversation--empty" : ""}`} role="log" aria-live="polite" aria-busy={loading || sending}>
                    {loading ? (
                        <p className="chat-conversation__status">Loading your conversation...</p>
                    ) : messages.length === 0 && !sending ? (
                        <div className="chat-welcome">
                            <div className="chat-welcome__icon" aria-hidden="true">✦</div>
                            <h1>What can I help you with?</h1>
                            <p>Ask about learning, your career, or interview preparation.</p>
                            <div className="chat-welcome__suggestions">
                                {SUGGESTIONS.map(suggestion => (
                                    <button
                                        key={suggestion}
                                        disabled={sending}
                                        onClick={() => submitMessage(suggestion)}
                                        type="button"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="chat-messages">
                            {messages.map((message, index) => (
                                <article
                                    className={`chat-message chat-message--${message.role === "assistant" ? "assistant" : "user"}`}
                                    key={message._id || message.createdAt || `${message.role}-${index}`}
                                >
                                    <span className="chat-message__sender">{message.role === "assistant" ? "AI" : "You"}</span>
                                    <p>{message.content}</p>
                                </article>
                            ))}
                            {sending && (
                                <article className="chat-message chat-message--assistant chat-message--pending">
                                    <span className="chat-message__sender">AI</span>
                                    <span className="chat-message__typing" aria-label="AI is answering">
                                        <span />
                                        <span />
                                        <span />
                                    </span>
                                </article>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <div className="chat-composer-wrap">
                    {notice && <p className="ai-limit-notice" role="status">{notice}</p>}
                    {error && <p className="chat-composer__error" role="alert">{error}</p>}
                    <form className="chat-composer" onSubmit={handleSubmit}>
                        <textarea
                            aria-label="Your message"
                            className="chat-composer__input"
                            disabled={loading || sending}
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                    event.preventDefault()
                                    event.currentTarget.form.requestSubmit()
                                }
                            }}
                            placeholder="Message AI..."
                            rows={3}
                            value={draft}
                        />
                        <button
                            aria-label="Send message"
                            className="chat-composer__send"
                            disabled={loading || sending || !draft.trim()}
                            type="submit"
                        >
                            {sending ? (
                                <span className="chat-composer__spinner" aria-label="Sending" />
                            ) : (
                                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m22 2-7 20-4-9-9-4Z" />
                                    <path d="M22 2 11 13" />
                                </svg>
                            )}
                        </button>
                    </form>
                    <p className="chat-composer__hint">Enter to send · Shift + Enter for a new line</p>
                </div>
            </section>
        </main>
    )
}

export default Chat
