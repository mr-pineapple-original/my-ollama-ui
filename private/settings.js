const settings = {
    model: "qwen3.5:4b",
    models: [
        "qwen3.5:4b",
        "qwen3:8b",
        "qwen3:1.7b",
    ],
    think: false,
    stream: true,
};

function updateSettings(newSettings) {
    Object.assign(settings, newSettings);
}

module.exports = {
    settings,
    updateSettings,
}