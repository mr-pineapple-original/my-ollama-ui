export function createStatsFooter(stats) {
    const footer = document.createElement("div");
    footer.className = "message-meta";

    const evalSeconds = stats.eval_duration / 1e9;
    const totalSeconds = stats.total_duration / 1e9;
    const tokPerSec = (stats.eval_count / evalSeconds).toFixed(1);

    footer.textContent =
        `${stats.model} • ` +
        `${stats.prompt_eval_count}→${stats.eval_count} tok • ` +
        `${tokPerSec} tok/s • ` +
        `${totalSeconds.toFixed(2)} s`;

    return footer;
}