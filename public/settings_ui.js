// this uses backend and is async

const settings = await fetch("/api/settings").then(r => r.json());

const model = document.getElementById("model");
const think = document.getElementById("think");
const stream = document.getElementById("stream");

for (const m of settings.models) {
    model.add(new Option(m, m));
}

model.value = settings.model;

think.classList.toggle("active", settings.think);
stream.classList.toggle("active", settings.stream);

async function saveSettings() {
    settings.model = model.value;

    await fetch("/api/settings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
    });
}

model.onchange = saveSettings;

think.onclick = async () => {
    settings.think = !settings.think;
    think.classList.toggle("active", settings.think);
    await saveSettings();
};

stream.onclick = async () => {
    settings.stream = !settings.stream;
    stream.classList.toggle("active", settings.stream);
    await saveSettings();
};