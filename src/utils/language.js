// Map legacy config values like zh-CN to Crowdin-provided codes
const LANGUAGE_ALIASES = {
  "zh-cn": "zh-Hans",
};

export default function normalizeLanguage(language) {
  if (!language) return "en";
  return LANGUAGE_ALIASES[language.toLowerCase()] || language;
}
