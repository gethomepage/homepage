export function resolveIcon(icon) {
    if (icon.startsWith("http")) {
        return `/api/proxy?url=${encodeURIComponent(icon)}`;
    }

    if (icon.startsWith("/")) {
        return icon;
    }

    if (icon.endsWith(".png")) {
        return `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${icon}`;
    }

    return `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${icon}.png`;
}