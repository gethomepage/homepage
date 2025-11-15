import themes from "utils/styles/themes";

/**
 * Calculate the relative luminance of a color according to WCAG 2.1
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {number} Relative luminance (0-1)
 */
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Parse a color string to RGB values
 * Supports hex (#rgb, #rrggbb), rgb/rgba, and named colors
 * @param {string} color - Color string
 * @returns {Object|null} Object with r, g, b values or null if parsing fails
 */
function parseColor(color) {
  if (!color || typeof color !== "string") return null;

  const trimmed = color.trim();

  // Hex colors (#rgb or #rrggbb)
  const hexMatch = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    }
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    };
  }

  // RGB/RGBA colors
  const rgbMatch = trimmed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/i);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  // Check if it's a homepage theme color name
  const lowerTrimmed = trimmed.toLowerCase();
  if (themes[lowerTrimmed]) {
    // Use the iconStart color from the theme (a good middle shade)
    const themeColor = themes[lowerTrimmed].iconStart;
    if (themeColor) {
      const hexMatch = themeColor.match(/^#([0-9a-f]{6})$/i);
      if (hexMatch) {
        const hex = hexMatch[1];
        return {
          r: parseInt(hex.substring(0, 2), 16),
          g: parseInt(hex.substring(2, 4), 16),
          b: parseInt(hex.substring(4, 6), 16),
        };
      }
    }
  }

  // Named colors (basic set) - fallback for non-theme colors
  const namedColors = {
    black: { r: 0, g: 0, b: 0 },
    white: { r: 255, g: 255, b: 255 },
    cyan: { r: 0, g: 255, b: 255 },
    magenta: { r: 255, g: 0, b: 255 },
    brown: { r: 165, g: 42, b: 42 },
    gray: { r: 128, g: 128, b: 128 },
    grey: { r: 128, g: 128, b: 128 },
  };

  if (namedColors[lowerTrimmed]) {
    return namedColors[lowerTrimmed];
  }

  return null;
}

/**
 * Resolve a color string to an actual color value
 * Supports hex, rgb, rgba, named colors, and homepage theme color names
 * @param {string} color - Color string (can be theme color name like "red", "blue", etc.)
 * @returns {string|null} Resolved color value (hex) or null if parsing fails
 */
export function resolveColor(color) {
  if (!color || typeof color !== "string") return null;

  const trimmed = color.trim();
  const lowerTrimmed = trimmed.toLowerCase();

  // Check if it's a homepage theme color name
  if (themes[lowerTrimmed]) {
    // Use the iconStart color from the theme (a good middle shade)
    return themes[lowerTrimmed].iconStart || null;
  }

  // If it's already a valid color format, return it
  if (parseColor(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Determine the best text color (white or black) for a given background color
 * Uses WCAG contrast ratio guidelines
 * @param {string} backgroundColor - Background color string (can be theme color name like "red", "blue", etc.)
 * @returns {string} "white" or "black"
 */
export function getContrastTextColor(backgroundColor) {
  // First resolve theme color names to actual colors
  const resolvedColor = resolveColor(backgroundColor) || backgroundColor;
  const rgb = parseColor(resolvedColor);
  
  if (!rgb) {
    // Default to white if color parsing fails
    return "white";
  }

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);

  // Use a threshold of 0.5 (midpoint)
  // Colors with luminance > 0.5 are light, use black text
  // Colors with luminance <= 0.5 are dark, use white text
  return luminance > 0.5 ? "black" : "white";
}

