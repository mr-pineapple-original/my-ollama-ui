export const messages =
    document.getElementById("messages");

export const input =
    document.getElementById("prompt");

export const send =
    document.getElementById("send");

export const composer = 
    document.getElementById("composer")

let chatId = null;


export function setChatId(id){
    chatId=id;
}


export function getChatId() {
    return chatId;
}