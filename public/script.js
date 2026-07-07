const messages = document.getElementById("messages");
const input = document.getElementById("prompt");
const send = document.getElementById("send");
const newChatButton = document.getElementById("new-chat");

// const messages_list = []

let chatId = null;

async function newChat() {

    const response = await fetch("/chat/new", {
        method: "POST"
    });

    const data = await response.json();

    chatId = data.chatId;
    console.log("New chat:", chatId);
}

async function loadChats() {

    const response = await fetch("/chats");

    const chats = await response.json();

    const list = document.getElementById("chat-list");

    list.innerHTML = "";

    chats.forEach(chat => {

        const button = document.createElement("button");

        button.className = "chat-item";

        button.textContent = chat.name;

        button.onclick = () => {
            openChat(chat.id)
        };

        list.appendChild(button);

    });
}

function addMessage(text, who) {

    const div = document.createElement("div");

    div.className = "message " + who;

    div.textContent = text;
    div.innerHTML = marked.parse(text);

    div.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block);
    });

    messages.appendChild(div);

    messages.scrollTop = messages.scrollHeight;


    if (who === 'tool_response') {
        askAI();
    }
}
async function openChat(id) {

    const response = await fetch(`/chat/${id}`);

    const chat = await response.json();

    chatId = chat.id;

    messages.innerHTML = "";

    chat.messages.forEach(msg => {

        if (msg.role === "user") {
            addMessage(msg.content, "user");
        }

        else if (msg.role === "assistant") {
            addMessage(msg.content, "ai");
        }

        else if (msg.role === "tool") {
            addMessage(msg.content, "tool_response");
        }

    });

}

async function askAI() {
    if (!chatId) {
        await newChat();
    }
    const prompt = input.value.trim();

    if (prompt === "")
        return;

    addMessage(prompt, "user");

    input.value = "";

    input.disabled = true;

    send.disabled = true;



    const typing = document.createElement("div");

    typing.className = "message ai typing";

    typing.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
    `;

    messages.appendChild(typing);

    messages.scrollTop = messages.scrollHeight;

    // NOTE: Make it POST, and send `messages_list` array to `/chat` end point in server.js
    const response = await fetch("/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        // body: JSON.stringify({
        //     message: prompt,
        //     message_list: messages_list
        // })
        body: JSON.stringify({
            chatId,
            message: prompt
        })
    });

    const data = await response.json();

    if (data.tool_response) {
        addMessage(data.tool_response, "tool_response")
    }

    if (data.ai) {
        addMessage(data.ai, "ai");
    }

    typing.remove();

    input.disabled = false;
    send.disabled = false;
    input.focus();
    
    await loadChats();
}

send.onclick = askAI;


input.addEventListener("keydown", (e) => {

    if (e.key === "Enter" && !e.shiftKey) {

        e.preventDefault();

        askAI();
    }

});

input.addEventListener("input", () => {

    input.style.height = "auto";

    input.style.height = input.scrollHeight + "px";

});



newChatButton.onclick = async () => {

    await newChat();

    messages.innerHTML = "";

};

loadChats();