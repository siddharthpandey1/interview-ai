const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const chatRateLimit = require("../middlewares/chatRateLimit.middleware")
const chatController = require("../controllers/chat.controller")

const chatRouter = express.Router()

chatRouter.use(authMiddleware.authUser)

/**
 * @route GET /api/chat
 * @description Get all chats owned by the logged in user.
 * @access private
 */
chatRouter.get("/", chatController.getAllChatsController)

/**
 * @route POST /api/chat
 * @description Create a chat or send a message to an existing chat.
 * @access private
 */
chatRouter.post("/", chatRateLimit, chatController.sendChatMessageController)

/**
 * @route GET /api/chat/:chatId
 * @description Get a chat's full message history.
 * @access private
 */
chatRouter.get("/:chatId", chatController.getChatByIdController)

/**
 * @route DELETE /api/chat/:chatId
 * @description Delete a chat owned by the logged in user.
 * @access private
 */
chatRouter.delete("/:chatId", chatController.deleteChatController)

module.exports = chatRouter
