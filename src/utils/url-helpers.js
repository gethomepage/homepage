export function ensureUrlProtocol(value) {
  if (!value || typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return trimmed;
  }

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function safeHostnameFromUrl(value) {
  try {
    return new URL(ensureUrlProtocol(value)).hostname;
  } catch {
    return value;
  }
}
