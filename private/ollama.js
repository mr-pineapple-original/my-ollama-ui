module.exports = {
    chat
};

const {
    loadChat,
    saveChat
} = require("./chat");

const { settings } = require("./settings");
const { tools } = require("./tools");

async function askOllama(messages, onToken = null, includeTools = true) {

    const response = await fetch("http://localhost:11434/api/chat", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            ...settings,
            messages,
            ...(includeTools ? { tools } : {})
        })

    });

    if (!response.ok)
        throw new Error(await response.text());

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";
    let fullMessage = "";
    let finalChunk = null;

    while (true) {

        const { done, value } = await reader.read();

        if (done)
            break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {

            if (!line.trim())
                continue;

            const chunk = JSON.parse(line);

            if (chunk.message?.content) {

                fullMessage += chunk.message.content;

                if (onToken)
                    onToken(chunk.message.content);

            }

            if (chunk.done)
                finalChunk = chunk;

        }

    }

    if (buffer.trim()) {

        const chunk = JSON.parse(buffer);

        if (chunk.message?.content) {

            fullMessage += chunk.message.content;

            if (onToken)
                onToken(chunk.message.content);

        }

        if (chunk.done)
            finalChunk = chunk;

    }

    return {
        message: {
            ...(finalChunk?.message ?? {}),
            content: fullMessage
        },
        stats: finalChunk
    };

}


async function chat(chatId, message, onToken = null) {

    const chat = loadChat(chatId);

    if (!chat)
        throw new Error("Chat not found");

    chat.messages.push({
        role: "user",
        content: message
    });

    chat.updatedAt = new Date().toISOString();

    let data = await askOllama(chat.messages, onToken);

    while (data.message.tool_calls?.length) {

        const toolCall = data.message.tool_calls[0];

        chat.messages.push(data.message);

        const args = toolCall.function.arguments ?? {};
        const fn = toolFunctions[toolCall.function.name];

        if (!fn)
            throw new Error(`Unknown tool: ${toolCall.function.name}`);

        const toolResponse = JSON.stringify(
            await fn(args)
        );

        chat.messages.push({
            role: "tool",
            content: toolResponse
        });

        data = await askOllama(chat.messages, onToken);

    }

    chat.messages.push({
        role: "assistant",
        content: data.message.content,
        stats: data.stats
    });

    if (chat.name === "New Chat") {

        chat.name = message.length > 30
            ? message.substring(0, 30) + "..."
            : message;

    }

    saveChat(chat);
    return {
        ai: data.content,
        stats: data.stats,
    };
}


