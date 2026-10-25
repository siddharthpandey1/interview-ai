const mongoose = require("mongoose")
const chatModel = require("../models/chat.model")
const interviewReportModel = require("../models/interviewReport.model")
const { generateChatResponse } = require("../services/ai.service")

let legacyIndexMigration

async function removeLegacyReportUniqueIndex() {
    if (!legacyIndexMigration) {
        legacyIndexMigration = (async () => {
            try {
                const indexes = await chatModel.collection.indexes()
                const legacyIndex = indexes.find(index =>
                    index.unique &&
                    index.key.report === 1 &&
                    index.key.user === 1
                )

                if (legacyIndex) {
                    await chatModel.collection.dropIndex(legacyIndex.name)
                }
            } catch (error) {
                if (error.code !== 26 && error.codeName !== "NamespaceNotFound") {
                    throw error
                }
            }
        })()
    }

    await legacyIndexMigration
}

function makeChatTitle(message) {
    const title = message.replace(/\s+/g, " ").trim()
    return title.length > 80 ? `${title.slice(0, 77)}...` : title
}

function getFirstUserMessage(messages) {
    return messages.find(message => message.role === "user")?.content
}

async function getOwnedReport(reportId, userId) {
    if (!reportId) {
        return null
    }

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
        return false
    }

    return interviewReportModel.findOne({ _id: reportId, user: userId })
}

function createReportContext(interviewReport) {
    if (!interviewReport) {
        return null
    }

    return {
        resume: interviewReport.resume,
        selfDescription: interviewReport.selfDescription,
        jobDescription: interviewReport.jobDescription,
        report: {
            title: interviewReport.title,
            matchScore: interviewReport.matchScore,
            technicalQuestions: interviewReport.technicalQuestions,
            behavioralQuestions: interviewReport.behavioralQuestions,
            skillGaps: interviewReport.skillGaps,
            preparationPlan: interviewReport.preparationPlan
        }
    }
}

async function getAllChatsController(req, res) {
    const chats = await chatModel.find({ user: req.user.id })
        .select("title updatedAt messages.role messages.content")
        .sort({ updatedAt: -1 })
        .lean()

    res.status(200).json({
        message: "Chats fetched successfully.",
        chats: chats.map(chat => ({
            _id: chat._id,
            title: chat.title || makeChatTitle(getFirstUserMessage(chat.messages || []) || "New chat"),
            updatedAt: chat.updatedAt
        }))
    })
}

async function getChatByIdController(req, res) {
    const { chatId } = req.params

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({
            message: "Invalid chat id."
        })
    }

    const chat = await chatModel.findOne({ _id: chatId, user: req.user.id })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found."
        })
    }

    res.status(200).json({
        message: "Chat fetched successfully.",
        chat
    })
}

async function sendChatMessageController(req, res) {
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : ""
    const { chatId, reportId } = req.body || {}

    if (!message) {
        return res.status(400).json({
            message: "Please provide a message."
        })
    }

    if (chatId && !mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({
            message: "Invalid chat id."
        })
    }

    if (reportId && !mongoose.Types.ObjectId.isValid(reportId)) {
        return res.status(400).json({
            message: "Invalid interview report id."
        })
    }

    const interviewReport = await getOwnedReport(reportId, req.user.id)

    if (reportId && !interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    await removeLegacyReportUniqueIndex()

    let chat = chatId
        ? await chatModel.findOne({ _id: chatId, user: req.user.id })
        : null

    if (chatId && !chat) {
        return res.status(404).json({
            message: "Chat not found."
        })
    }

    if (chat && reportId && chat.report && chat.report.toString() !== reportId) {
        return res.status(400).json({
            message: "This chat is linked to a different interview report."
        })
    }

    const linkedReport = interviewReport || (
        chat?.report
            ? await getOwnedReport(chat.report.toString(), req.user.id)
            : null
    )

    if (chat?.report && !linkedReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    if (!chat) {
        chat = new chatModel({
            user: req.user.id,
            report: reportId || undefined,
            title: makeChatTitle(message),
            messages: []
        })
    } else if (!chat.report && reportId) {
        chat.report = reportId
    }

    if (!chat.title || chat.title === "New chat") {
        chat.title = makeChatTitle(getFirstUserMessage(chat.messages) || message)
    }

    const history = chat.messages.slice(-19).map(({ role, content }) => ({ role, content }))
    chat.messages.push({ role: "user", content: message })
    await chat.save()

    const reply = await generateChatResponse({
        message,
        history,
        context: createReportContext(linkedReport)
    })

    chat.messages.push({ role: "assistant", content: reply })
    await chat.save()

    res.status(200).json({
        message: "Chat response generated successfully.",
        chat
    })
}

async function deleteChatController(req, res) {
    const { chatId } = req.params

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({
            message: "Invalid chat id."
        })
    }

    const chat = await chatModel.findOneAndDelete({
        _id: chatId,
        user: req.user.id
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found."
        })
    }

    res.status(200).json({
        message: "Chat deleted successfully."
    })
}

module.exports = {
    getAllChatsController,
    getChatByIdController,
    sendChatMessageController,
    deleteChatController
}
