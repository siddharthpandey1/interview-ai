import { createContext,useState } from "react";


export const InterviewContext = createContext()

export const InterviewProvider = ({ children }) => {
    const [loading, setLoading] = useState(false)
    const [report, setReport] = useState(null)
    const [reports, setReports] = useState([])
    const [chats, setChats] = useState([])
    const [chatMessages, setChatMessages] = useState([])
    const [chatListLoading, setChatListLoading] = useState(false)
    const [chatLoading, setChatLoading] = useState(false)
    const [chatSending, setChatSending] = useState(false)
    const [chatError, setChatError] = useState("")

    return (
        <InterviewContext.Provider value={{
            loading, setLoading, report, setReport, reports, setReports,
            chats, setChats, chatMessages, setChatMessages,
            chatListLoading, setChatListLoading, chatLoading, setChatLoading,
            chatSending, setChatSending, chatError, setChatError
        }}>
            {children}
        </InterviewContext.Provider>
    )
}