
const newChatButton = document.getElementById("new-chat");

import { 
    askAI,
    newChat,
    loadChats,
    openChat
} from "./async_script.js";

import {
    messages,
    input,
    send
} from "./state.js";

import "./settings_ui.js";

export function addMessage(text, who) {

    const div=document.createElement("div");

    div.className="message "+who;


    div.innerHTML=marked.parse(text);


    div.querySelectorAll("pre code")
    .forEach(block=>{
        hljs.highlightElement(block);
    });


    messages.appendChild(div);


    messages.scrollTop =
        messages.scrollHeight;

    return div;

}




send.onclick = askAI;



input.addEventListener(
"keydown",
(e)=>{

    if(e.key==="Enter" && !e.shiftKey){

        e.preventDefault();

        askAI();

    }

});



input.addEventListener(
"input",
()=>{

    input.style.height="auto";

    input.style.height=
        input.scrollHeight+"px";

});



newChatButton.onclick = newChat;



window.onload = async()=>{

    await loadChats();


    const id =
        new URLSearchParams(
            location.search
        ).get("chat");


    if(id)
        await openChat(id);

};



window.onpopstate=()=>{

    const id =
        new URLSearchParams(
            location.search
        ).get("chat");


    if(id)
        openChat(id);

};


// auto focus the prompt
input.focus()

// auto focus on any keydown
document.addEventListener("keydown", (e) => {
    const active = document.activeElement;

    // Ignore shortcuts/modifier keys
    if (
        e.ctrlKey ||
        e.altKey ||
        e.metaKey ||
        e.key === "Control" ||
        e.key === "Alt" ||
        e.key === "Meta" ||
        e.key === "Shift"
    ) {
        return;
    }


    if (
        active === prompt ||
        active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.tagName === "SELECT" ||
        active.isContentEditable
    ) {
        return;
    }

    input.focus();
});