const express = require("express");
const crypto = require("crypto");

const {
    createChat,
    loadChat,
    saveChat,
    listChats
} = require("./chat");

const app = express();
const PORT = 3000;


app.use(express.static("public"));
app.use(express.json());


const tools = [
    {
        type: "function",
        function: {
            name: "get_time",
            description: "Returns the current server time.",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    }]


app.post("/chat/new", (req, res) => {

    const chatId = crypto.randomUUID();

    createChat(chatId);

    res.json({ chatId });

});

app.get("/chats", (req, res) => {
    res.json(listChats());
});

app.get("/chat/:id", (req, res) => {

    const chat = loadChat(req.params.id);

    if (!chat) {
        return res.status(404).json({
            error: "Chat not found"
        });
    }

    res.json(chat);

});

app.post("/chat", async (req, res,) => {

    const { chatId, message } = req.body;

    const chat = loadChat(chatId);

    if (!chat) {
        return res.status(404).json({
            error: "Chat not found"
        });
    }

    chat.messages.push({
        role: "user",
        content: message
    });

    chat.updatedAt = new Date().toISOString();

    saveChat(chat);

    try {
        const response = await fetch("http://localhost:11434/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "qwen3.5:4b",
                think: false,
                stream: false,
                tools,
                messages: chat.messages
            })
        });

        const data = await response.json();



        if (data.message.tool_calls) {
            const toolObj = data.message.tool_calls;
            console.log(toolObj);

            let tool_response = '';

            // agent can call multiple functions so need to loop over them to be more proper
            if (toolObj[0].function.name === 'get_time') {
                tool_response = get_time();
            }

            res.json({
                user: message,
                tool_response: tool_response,
            });

        } else {
            chat.messages.push({
                role: "assistant",
                content: data.message.content
            });

            if (chat.name === "New Chat") {

                chat.name = message.length > 30
                    ? message.substring(0, 30) + "..."
                    : message;

            }

            saveChat(chat)

            res.json({
                ai: data.message.content
            });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Failed to contact Ollama."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});



function get_time() {

    return new Date().toUTCString();
}

