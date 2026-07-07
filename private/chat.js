const fs = require("fs");
const path = require("path");

module.exports = {
    createChat,
    loadChat,
    saveChat,
    listChats,
    removeChat
};


const CHAT_DIR = path.join(__dirname,"..", "chats");

if (!fs.existsSync(CHAT_DIR)) {
    fs.mkdirSync(CHAT_DIR, { recursive: true });
}

function getChatFile(chatId) {
    return path.join(CHAT_DIR, `${chatId}.json`);
}

function createChat(chatId) {

    const chat = {
        id: chatId,
        name: "New Chat",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
    };

    fs.writeFileSync(
        getChatFile(chatId),
        JSON.stringify(chat, null, 4)
    );
}

function loadChat(chatId) {
    return JSON.parse(
        fs.readFileSync(getChatFile(chatId), "utf8")
    );
}

function saveChat(chat) {

    fs.writeFileSync(
        getChatFile(chat.id),
        JSON.stringify(chat, null, 4)
    );

}

function listChats() {

    const files = fs.readdirSync(CHAT_DIR);

    return files
        .filter(file => file.endsWith(".json"))
        .map(file => {

            const chatId = path.basename(file, ".json");

            const chat = JSON.parse(
                fs.readFileSync(
                    path.join(CHAT_DIR, file),
                    "utf8"
                )
            );

            return {
                id: chat.id,
                name: chat.name,
                updatedAt: chat.updatedAt
            };

        });
}

function removeChat(chatId) {

    const file = getChatFile(chatId);

    if (fs.existsSync(file)) {
        fs.unlinkSync(file);
    }

}