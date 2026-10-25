const mongoose = require("mongoose")

const chatMessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: [ "user", "assistant" ],
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

const chatSchema = new mongoose.Schema({
    report: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewReport",
        required: false
    },
    title: {
        type: String,
        required: true,
        default: "New chat"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    messages: [ chatMessageSchema ]
}, {
    timestamps: true
})

const chatModel = mongoose.model("Chat", chatSchema)

module.exports = chatModel
