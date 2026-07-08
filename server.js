const express = require("express");
const crypto = require("crypto");
const {settings, updateSettings} = require("./private/settings");

const {
    createChat,
    loadChat,
    listChats,
    removeChat
} = require("./private/chat");

const {
    chat
} = require("./private/ollama");

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

app.post("/chat/new", (req, res) => {

    const chatId = crypto.randomUUID();

    createChat(chatId);

    res.json({
        chatId
    });

});

app.get("/chats", (req, res) => {

    res.json(listChats());

});

app.get("/chat/:id", (req, res) => {

    const chat = loadChat(req.params.id);

    if (!chat)
        return res.status(404).json({
            error: "Chat not found"
        });

    res.json(chat);

});

app.get("/api/settings", (req, res) => {
    res.json(settings);
});

app.post("/api/settings", (req, res) => {
    updateSettings(req.body);
    res.json(settings);
});

app.delete("/chat/:id", (req, res) => {

    removeChat(req.params.id);

    res.json({
        success: true
    });

});

app.post("/chat", async (req, res) => {

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    try {

        await chat(
            req.body.chatId,
            req.body.message,
            (token) => {
                res.write(token);
            }
        );

        res.end();

    } catch (err) {

        console.error(err);

        res.status(500).end(err.message);

    }

});

app.listen(PORT, () => {

    console.log(`Server running at http://localhost:${PORT}`);

});
