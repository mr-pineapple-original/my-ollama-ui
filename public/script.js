const messages = document.getElementById("messages");
const input = document.getElementById("prompt");
const send = document.getElementById("send");

const messages_list = []

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



    const roleMap = {
        user: "user",
        ai: "assistant",
        tool_response: "tool"
    };

    const role = roleMap[who] ?? "user";

    messages_list.push({
        role,
        content: text,
    })


    if (role === 'tool') {
        askAI();
    }
}

async function askAI() {

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
        body: JSON.stringify({
            message: prompt,
            message_list: messages_list
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