import {
    getChatId,
    setChatId,
    messages,
    input,
    send,
    composer
} from "./state.js";

import {
    addMessage
} from "./script.js";

import {
    createStatsFooter
} from "./stats_parser.js";

// ------------------------------------------------------------------
export async function askAI() {

    if (!getChatId()) {
        await newChat();
    }


    const prompt = input.value.trim();

    if (!prompt)
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

    composer.disabled = true

    try {

        const response = await fetch("/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                chatId: getChatId(),

                message: prompt

            })

        });

        typing.remove();
        const ai = document.createElement("div");

        ai.className = "message ai";

        messages.appendChild(ai);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let content = "";
        let lastRender = 0;

        function render() {

            ai.innerHTML = marked.parse(content);

            ai.querySelectorAll("pre code").forEach(block => {
                hljs.highlightElement(block);
            });

            messages.scrollTop = messages.scrollHeight;

        }
        let stats = null;

        while (true) {

            const { done, value } = await reader.read();

            if (done)
                break;

            content += decoder.decode(value, { stream: true });

            // Extract metadata if it has arrived
            const marker = "\n__META__";
            const idx = content.indexOf(marker);

            if (idx !== -1) {

                try {
                    stats = JSON.parse(content.slice(idx + marker.length));
                    content = content.slice(0, idx);
                } catch {
                    // JSON probably hasn't fully arrived yet
                }

            }

            const now = performance.now();

            if (now - lastRender > 40) {
                render();
                lastRender = now;
            }

        }

        // Final cleanup in case metadata arrived at the very end
        const marker = "\n__META__";
        const idx = content.indexOf(marker);

        if (idx !== -1) {

            stats = JSON.parse(content.slice(idx + marker.length));
            content = content.slice(0, idx);

        }

        render();

        if (stats) {
            ai.appendChild(createStatsFooter(stats));
        }

    } catch (err) {

        typing.remove();

        addMessage(
            "Error contacting server.",
            "ai"
        );

        console.error(err);

    }


    typing.remove();
    composer.disabled = false

    input.disabled = false;
    send.disabled = false;

    input.focus();

    await loadChats();

}

// ------------------------------------------------------------------
export async function newChat() {

    const response = await fetch("/chat/new", {
        method: "POST"
    });

    const data = await response.json();

    setChatId(data.chatId);

    history.pushState(
        {},
        "",
        `/?chat=${getChatId()}`
    );


    messages.innerHTML = "";

    await loadChats();
}

export async function loadChats() {

    const response = await fetch("/chats");

    const chats = await response.json();

    const list = document.getElementById("chat-list");

    list.innerHTML = "";


    chats.forEach(chat => {

        const row = document.createElement("div");

        row.className = "chat-row";


        const button = document.createElement("button");

        button.className = "chat-item";

        button.textContent = chat.name;

        if (getChatId() === chat.id) {
            button.classList.add("active");
        }

        button.onclick = () => {
            openChat(chat.id);
        };


        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-chat";

        deleteButton.textContent = "×";


        deleteButton.onclick = async (e) => {

            e.stopPropagation();

            await deleteChat(chat.id);

        };


        row.append(
            button,
            deleteButton
        );


        list.appendChild(row);

    });

}

export async function openChat(id) {

    setChatId(id)

    // remove active from previous chat
    document.querySelectorAll(".chat-item")
        .forEach(item => item.classList.remove("active"));


    // add active to clicked chat
    event.currentTarget.classList.add("active");

    history.pushState(
        {},
        "",
        `/?chat=${id}`
    );


    const response = await fetch(`/chat/${id}`);

    const chat = await response.json();


    messages.innerHTML = "";


    chat.messages.forEach(msg => {

        if (msg.role === "user")
            addMessage(msg.content, "user");


        if (msg.role === "assistant") {
            const ai = addMessage(msg.content, "ai");

            if (msg.stats) {
                ai.appendChild(createStatsFooter(msg.stats));
            }
        }
        if (msg.role === "tool")
            addMessage(msg.content, "tool_response")

    });

}

async function deleteChat(id) {

    await fetch(`/chat/${id}`, {

        method: "DELETE"

    });


    if (getChatId() === id) {

        setChatId(null)

        messages.innerHTML = "";

        history.pushState(
            {},
            "",
            "/"
        );

    }


    await loadChats();

}

// always loadChats() once whenever browser is refreshed or webpg is opened
await loadChats();