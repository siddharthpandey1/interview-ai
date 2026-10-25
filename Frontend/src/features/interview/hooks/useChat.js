import { useContext, useEffect } from "react"
import { useSearchParams } from "react-router"
import { InterviewContext } from "../interview.context"
import { deleteChat as deleteChatRequest, getChatById, getChats, sendChatMessage as sendChatMessageRequest } from "../services/chat.api"

const getErrorMessage = (error, fallback) => error.response?.data?.message || error.message || fallback

export const useChat = () => {
    const context = useContext(InterviewContext)

    if (!context) {
        throw new Error("useChat must be used within an InterviewProvider")
    }

    const {
        chats,
        setChats,
        chatMessages,
        setChatMessages,
        chatListLoading,
        setChatListLoading,
        chatLoading,
        setChatLoading,
        chatSending,
        setChatSending,
        chatError,
        setChatError
    } = context
    const [searchParams, setSearchParams] = useSearchParams()
    const activeChatId = searchParams.get("chatId")
    const reportId = searchParams.get("reportId")

    useEffect(() => {
        let isCurrent = true

        const loadChats = async () => {
            setChatError("")
            setChatListLoading(true)
            try {
                const response = await getChats()
                if (isCurrent) {
                    setChats(response.chats || [])
                }
            } catch (error) {
                if (isCurrent) {
                    setChatError(getErrorMessage(error, "Unable to load chats."))
                }
            } finally {
                if (isCurrent) {
                    setChatListLoading(false)
                }
            }
        }

        loadChats()

        return () => {
            isCurrent = false
        }
    }, [ setChatError, setChatListLoading, setChats ])

    useEffect(() => {
        let isCurrent = true

        if (!activeChatId) {
            setChatMessages([])
            setChatLoading(false)
            return () => {
                isCurrent = false
            }
        }

        const loadChat = async () => {
            setChatMessages([])
            setChatError("")
            setChatLoading(true)

            try {
                const response = await getChatById(activeChatId)
                if (isCurrent) {
                    setChatMessages(response.chat?.messages || [])
                }
            } catch (error) {
                if (isCurrent) {
                    setChatError(getErrorMessage(error, "Unable to load this chat."))
                }
            } finally {
                if (isCurrent) {
                    setChatLoading(false)
                }
            }
        }

        loadChat()

        return () => {
            isCurrent = false
        }
    }, [ activeChatId, setChatError, setChatLoading, setChatMessages ])

    const selectChat = (chatId) => {
        setChatError("")
        setSearchParams({ chatId })
    }

    const startNewChat = () => {
        setChatError("")
        setSearchParams({})
        setChatMessages([])
    }

    const sendMessage = async (message) => {
        if (chatLoading || chatSending) {
            return false
        }

        setChatSending(true)
        setChatError("")

        try {
            const response = await sendChatMessageRequest({
                message,
                chatId: activeChatId || undefined,
                reportId: activeChatId ? undefined : reportId || undefined
            })
            const chat = response.chat
            setChatMessages(chat?.messages || [])

            if (chat?._id) {
                setChats(currentChats => [
                    { _id: chat._id, title: chat.title, updatedAt: chat.updatedAt },
                    ...currentChats.filter(item => item._id !== chat._id)
                ])
                if (!activeChatId) {
                    setSearchParams({ chatId: chat._id }, { replace: true })
                }
            }

            return true
        } catch (error) {
            setChatError(getErrorMessage(error, "Unable to send your message."))
            return false
        } finally {
            setChatSending(false)
        }
    }

    const removeChat = async (chatId) => {
        setChatError("")
        try {
            await deleteChatRequest(chatId)
            setChats(currentChats => currentChats.filter(chat => chat._id !== chatId))
            if (activeChatId === chatId) {
                startNewChat()
            }
            return true
        } catch (error) {
            setChatError(getErrorMessage(error, "Unable to delete this chat."))
            return false
        }
    }

    return {
        chats,
        messages: chatMessages,
        activeChatId,
        loading: chatLoading,
        listLoading: chatListLoading,
        sending: chatSending,
        error: chatError,
        selectChat,
        startNewChat,
        sendMessage,
        removeChat
    }
}
