const express = require("express");

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




// change to post
// get new param `messages_list` so pass all messages 
app.post("/chat", async (req, res,) => {

    const { message, message_list } = req.body;

    message_list.push({
        role: "user",
        content: message
    });

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
                messages: message_list
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
            res.json({
                user: message,
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