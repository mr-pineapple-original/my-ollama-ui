const toolFunctions = {
    get_time,
    get_cpu_usage,
    read_file
};

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
    },
    {
        type: "function",
        function: {
            name: "get_cpu_usage",
            description: "Returns the cpu usage of node process.",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        type: "function",
        function: {
            name: "read_file",
            description: "Reads the contents of a file from the local computer.",
            parameters: {
                type: "object",
                properties: {
                    path: {
                        type: "string",
                        description: "Absolute or relative path to the file, e.g. '/home/mr-pineapple/Downloads/student.cpp' or '~/Downloads/student.cpp'."
                    }
                },
                required: ["path"]
            }
        }
    }
];

function get_time() {
    return new Date().toUTCString();
}

function get_cpu_usage() {
    return process.cpuUsage();
}

function read_file(filePath) {
    const fs = require("fs");
    const os = require("os");
    const path = require("path");

    // if (filePath.startsWith("~/")) {
    //     filePath = path.join(os.homedir(), filePath.slice(2));
    // }

    return fs.readFileSync(filePath, "utf8");
}

module.exports = {
    tools,
    toolFunctions
};

