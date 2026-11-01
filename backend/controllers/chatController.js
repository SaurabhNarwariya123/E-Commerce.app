import crypto from 'crypto';
import { chatGraph } from '../ai/graph/chatGraph.js';
import chatLogModel from '../models/chatLogModel.js';

const MAX_HISTORY = 6
const MAX_HISTORY_TEXT = 500
const MAX_LOGGED_MESSAGE = 500

// History comes from the browser, so treat it as untrusted: only plain
// user/assistant text, capped in count and length.
const sanitizeHistory = (history) => {
    if (!Array.isArray(history)) return []
    return history
        .filter(h => h && (h.role === 'user' || h.role === 'assistant') && typeof h.text === 'string' && h.text.trim())
        .slice(-MAX_HISTORY)
        .map(h => ({ role: h.role, text: h.text.trim().slice(0, MAX_HISTORY_TEXT) }))
}

export const chat = async (req, res) => {
    const requestId = crypto.randomUUID();
    const { message, history: rawHistory } = req.body || {};
    const history = sanitizeHistory(rawHistory);

    if (!message || typeof message !== 'string' || !message.trim()) {
        return res.json({
            success: false,
            message: 'message is required'
        });
    }

    // Identity comes only from the verified token, never from the request body.
    const adminId = req.admin?.id || null;
    const adminEmail = req.admin?.id || null;
    const loggedMessage = message.slice(0, MAX_LOGGED_MESSAGE);

    try {
        const result = await chatGraph.invoke({
            adminId,
            adminEmail,
            message,
            history,
            requestId,
        });

        chatLogModel.create({
            adminId,
            requestId,
            message: loggedMessage,
            intent: result.intent || null,
            sourceLabel: result.sourceLabel || null,
            success: true,
        }).catch((error) => {
            console.error("Chat log error:", error.message);
        });

        return res.json({
            success: true,
            answer: result.answer,
            sources: result.sources || [],
            requestId,
        });

    } catch (error) {
        console.error("Chat error:", error);

        chatLogModel.create({
            adminId,
            requestId,
            message: loggedMessage,
            success: false,
            errorMessage: error.message,
        }).catch((logError) => {
            console.error("Failed to save chat error log:", logError.message);
        });

        return res.json({
            success: false,
            message: 'Something went wrong answering that question. Please try again.',
            requestId,
        });
    }
};
