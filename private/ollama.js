const {
    loadChat,
    saveChat
} = require("./chat");

const {
    tools,
    toolFunctions
} = require("./tools");


async function askOllama(messages, includeTools = true) {

    const response = await fetch("http://localhost:11434/api/chat", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

async function askOllama(messages, includeTools = true) {

    const response = await fetch("http://localhost:11434/api/chat", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            model: "qwen3:1.7b",
            think: false,
            stream: false,
            messages,
            ...(includeTools ? { tools } : {})
        })

    });

    return response.json();
}

        body: JSON.stringify({
            model: "qwen3:1.7b",
            think: false,
            stream: false,
            messages,
            ...(includeTools ? { tools } : {})
        })

    });

    return response.json();
}


async function chat(chatId, message) {

    const chat = loadChat(chatId);

    if (!chat)
        throw new Error("Chat not found");


    chat.messages.push({
        role: "user",
        content: message
    });

    chat.updatedAt = new Date().toISOString();

    let data = await askOllama(chat.messages);

    console.log(JSON.stringify(data, null, 2));
    
    while (data.message.tool_calls) {

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

        data = await askOllama(chat.messages);
    }

    chat.messages.push({
        role: "assistant",
        content: data.message.content
    });

    if (chat.name === "New Chat") {

        chat.name = message.length > 30
            ? message.substring(0, 30) + "..."
            : message;

    }

    saveChat(chat);

    return {
        ai: data.message.content
    };
}


module.exports = {
    chat
};
