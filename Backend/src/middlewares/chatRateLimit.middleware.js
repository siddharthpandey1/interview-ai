const messageWindows = new Map()
const windowDuration = 60 * 1000
const messageLimit = 20

function chatRateLimit(req, res, next) {
    const userId = req.user.id
    const now = Date.now()

    if (typeof req.body?.message !== "string" || !req.body.message.trim()) {
        return next()
    }

    const recentMessages = (messageWindows.get(userId) || [])
        .filter(timestamp => now - timestamp < windowDuration)

    if (recentMessages.length >= messageLimit) {
        const retryAfter = Math.ceil((recentMessages[0] + windowDuration - now) / 1000)
        res.set("RateLimit-Limit", String(messageLimit))
        res.set("RateLimit-Remaining", "0")
        res.set("RateLimit-Reset", String(retryAfter))
        res.set("Retry-After", String(retryAfter))
        return res.status(429).json({
            message: "Chat message limit reached. Please try again in a minute."
        })
    }

    recentMessages.push(now)
    messageWindows.set(userId, recentMessages)

    res.set("RateLimit-Limit", String(messageLimit))
    res.set("RateLimit-Remaining", String(messageLimit - recentMessages.length))
    res.set("RateLimit-Reset", String(Math.ceil((recentMessages[0] + windowDuration - now) / 1000)))

    if (messageWindows.size > 1000) {
        for (const [ storedUserId, timestamps ] of messageWindows) {
            if (timestamps.length === 0 || now - timestamps[timestamps.length - 1] >= windowDuration) {
                messageWindows.delete(storedUserId)
            }
        }
    }

    next()
}

module.exports = chatRateLimit
