import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    withCredentials: true,
})

export const getChats = async () => {
    const response = await api.get("/api/chat")
    return response.data
}

export const getChatById = async (chatId) => {
    const response = await api.get(`/api/chat/${chatId}`)
    return response.data
}

export const sendChatMessage = async ({ message, chatId, reportId }) => {
    const response = await api.post("/api/chat", { message, chatId, reportId })
    return response.data
}

export const deleteChat = async (chatId) => {
    const response = await api.delete(`/api/chat/${chatId}`)
    return response.data
}
