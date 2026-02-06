/**
 * Parse keyboard shortcut configuration string
 * @param {string} shortcut - Shortcut string like "ctrl+k", "alt+shift+p", etc.
 * @returns {Object} Parsed shortcut with key and modifiers
 */
export function parseKeyboardShortcut(shortcut = "ctrl+k") {
  const parts = shortcut.toLowerCase().split("+");
  const key = parts[parts.length - 1];

  return {
    key,
    modifiers: {
      ctrl: parts.includes("ctrl"),
      meta: parts.includes("meta") || parts.includes("cmd"),
      alt: parts.includes("alt") || parts.includes("option"),
      shift: parts.includes("shift"),
    },
  };
}

/**
 * Check if a keyboard event matches the parsed shortcut configuration
 * @param {KeyboardEvent} event - The keyboard event
 * @param {Object} shortcutConfig - Parsed shortcut config from parseKeyboardShortcut
 * @returns {boolean} True if the event matches the shortcut
 */
export function matchesKeyboardShortcut(event, shortcutConfig) {
  const { key, modifiers } = shortcutConfig;

  // Check if the key matches
  if (event.key.toLowerCase() !== key) {
    return false;
  }

  // If no modifiers specified, default to ctrl or meta
  const hasNoModifiers = !modifiers.ctrl && !modifiers.meta && !modifiers.alt && !modifiers.shift;
  if (hasNoModifiers) {
    return event.ctrlKey || event.metaKey;
  }

  // Check if modifiers match
  // Allow ctrl and meta to be interchangeable (for cross-platform support)
  const ctrlMetaMatch =
    modifiers.ctrl || modifiers.meta ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;

  const altMatch = modifiers.alt ? event.altKey : !event.altKey;
  const shiftMatch = modifiers.shift ? event.shiftKey : !event.shiftKey;

  return ctrlMetaMatch && altMatch && shiftMatch;
}
