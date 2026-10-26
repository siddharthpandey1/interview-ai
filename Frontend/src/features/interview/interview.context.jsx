import { createContext,useState } from "react";


export const InterviewContext = createContext()

export const InterviewProvider = ({ children }) => {
    const [loading, setLoading] = useState(false)
    const [report, setReport] = useState(null)
    const [reports, setReports] = useState([])
    const [reportNotice, setReportNotice] = useState("")
    const [chats, setChats] = useState([])
    const [chatMessages, setChatMessages] = useState([])
    const [chatListLoading, setChatListLoading] = useState(false)
    const [chatLoading, setChatLoading] = useState(false)
    const [chatSending, setChatSending] = useState(false)
    const [chatError, setChatError] = useState("")
    const [chatNotice, setChatNotice] = useState("")

    return (
        <InterviewContext.Provider value={{
            loading, setLoading, report, setReport, reports, setReports, reportNotice, setReportNotice,
            chats, setChats, chatMessages, setChatMessages,
            chatListLoading, setChatListLoading, chatLoading, setChatLoading,
            chatSending, setChatSending, chatError, setChatError, chatNotice, setChatNotice
        }}>
            {children}
        </InterviewContext.Provider>
    )
}