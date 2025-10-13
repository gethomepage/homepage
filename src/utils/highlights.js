const DEFAULT_LEVEL_CLASSES = {
  good: "bg-emerald-500/40 text-emerald-950 dark:bg-emerald-900/60 dark:text-emerald-400",
  warn: "bg-amber-300/30 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  danger: "bg-rose-700/45 text-rose-200 dark:bg-rose-950/70 dark:text-rose-400",
};

const normalizeFieldKeys = (fields, widgetType) => {
  if (!fields || typeof fields !== "object") return {};

  return Object.entries(fields).reduce((acc, [key, value]) => {
    if (value === null || value === undefined) return acc;
    if (typeof key !== "string") return acc;
    const trimmedKey = key.trim();
    if (trimmedKey === "") return acc;

    acc[trimmedKey] = value;

    if (widgetType && !trimmedKey.includes(".")) {
      const namespacedKey = `${widgetType}.${trimmedKey}`;
      if (!(namespacedKey in acc)) {
        acc[namespacedKey] = value;
      }
    }

    return acc;
  }, {});
};

export const buildHighlightConfig = (globalConfig, widgetConfig, widgetType) => {
  const levels = {
    ...DEFAULT_LEVEL_CLASSES,
    ...(globalConfig?.levels || {}),
    ...(widgetConfig?.levels || {}),
  };

  const { levels: _levels, ...fields } = widgetConfig || {};
  const normalizedFields = normalizeFieldKeys(fields, widgetType);

  const hasLevels = Object.values(levels).some(Boolean);
  const hasFields = Object.keys(normalizedFields).length > 0;

  if (!hasLevels && !hasFields) return null;

  return { levels, fields: normalizedFields };
};

const NUMERIC_OPERATORS = {
  gt: (value, target) => value > target,
  gte: (value, target) => value >= target,
  lt: (value, target) => value < target,
  lte: (value, target) => value <= target,
  eq: (value, target) => value === target,
  ne: (value, target) => value !== target,
};

const STRING_OPERATORS = {
  equals: (value, target, caseSensitive) =>
    caseSensitive ? value === target : value.toLowerCase() === target.toLowerCase(),
  includes: (value, target, caseSensitive) =>
    caseSensitive ? value.includes(target) : value.toLowerCase().includes(target.toLowerCase()),
  startsWith: (value, target, caseSensitive) =>
    caseSensitive ? value.startsWith(target) : value.toLowerCase().startsWith(target.toLowerCase()),
  endsWith: (value, target, caseSensitive) =>
    caseSensitive ? value.endsWith(target) : value.toLowerCase().endsWith(target.toLowerCase()),
};

const toNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const trimmed = value.trim();
    const candidate = Number(trimmed);
    if (!Number.isNaN(candidate)) return candidate;
  }
  return undefined;
};

const parseNumericValue = (value) => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const direct = Number(trimmed);
    if (!Number.isNaN(direct)) return direct;

    const compact = trimmed.replace(/\s+/g, "");
    if (!compact || !/^[-+]?[0-9.,]+$/.test(compact)) return undefined;

    const commaCount = (compact.match(/,/g) || []).length;
    const dotCount = (compact.match(/\./g) || []).length;

    if (commaCount && dotCount) {
      const lastComma = compact.lastIndexOf(",");
      const lastDot = compact.lastIndexOf(".");
      if (lastComma > lastDot) {
        const asDecimal = compact.replace(/\./g, "").replace(/,/g, ".");
        const parsed = Number(asDecimal);
        return Number.isNaN(parsed) ? undefined : parsed;
      }
      const asThousands = compact.replace(/,/g, "");
      const parsed = Number(asThousands);
      return Number.isNaN(parsed) ? undefined : parsed;
    }

    if (commaCount) {
      const parts = compact.split(",");
      if (commaCount === 1 && parts[1]?.length <= 2) {
        const parsed = Number(compact.replace(",", "."));
        if (!Number.isNaN(parsed)) return parsed;
      }
      const isGrouped = parts.length > 1 && parts.slice(1).every((part) => part.length === 3);
      if (isGrouped) {
        const parsed = Number(compact.replace(/,/g, ""));
        if (!Number.isNaN(parsed)) return parsed;
      }
      return undefined;
    }

    if (dotCount) {
      const parts = compact.split(".");
      if (dotCount === 1 && parts[1]?.length <= 2) {
        const parsed = Number(compact);
        if (!Number.isNaN(parsed)) return parsed;
      }
      const isGrouped = parts.length > 1 && parts.slice(1).every((part) => part.length === 3);
      if (isGrouped) {
        const parsed = Number(compact.replace(/\./g, ""));
        if (!Number.isNaN(parsed)) return parsed;
      }
      const parsed = Number(compact);
      return Number.isNaN(parsed) ? undefined : parsed;
    }

    const parsed = Number(compact);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  if (typeof value === "object" && value !== null && "props" in value) {
    return undefined;
  }

  return undefined;
};

const evaluateNumericRule = (value, rule) => {
  if (!rule || typeof rule !== "object") return false;
  const operator = rule.when && NUMERIC_OPERATORS[rule.when];
  const numericValue = toNumber(rule.value);
  if (operator && numericValue !== undefined) {
    const passes = operator(value, numericValue);
    return rule.negate ? !passes : passes;
  }

  if (rule.when === "between") {
    const min = toNumber(rule.min ?? rule.value?.min);
    const max = toNumber(rule.max ?? rule.value?.max);
    if (min === undefined && max === undefined) return false;
    const lowerBound = min ?? Number.NEGATIVE_INFINITY;
    const upperBound = max ?? Number.POSITIVE_INFINITY;
    const passes = value >= lowerBound && value <= upperBound;
    return rule.negate ? !passes : passes;
  }

  if (rule.when === "outside") {
    const min = toNumber(rule.min ?? rule.value?.min);
    const max = toNumber(rule.max ?? rule.value?.max);
    if (min === undefined && max === undefined) return false;
    const passes = value < (min ?? Number.NEGATIVE_INFINITY) || value > (max ?? Number.POSITIVE_INFINITY);
    return rule.negate ? !passes : passes;
  }

  return false;
};

const evaluateStringRule = (value, rule) => {
  if (!rule || typeof rule !== "object") return false;
  if (rule.when === "regex" && typeof rule.value === "string") {
    try {
      const flags = rule.flags || (rule.caseSensitive ? "" : "i");
      const regex = new RegExp(rule.value, flags);
      const passes = regex.test(value);
      return rule.negate ? !passes : passes;
    } catch (error) {
      return false;
    }
  }

  const operator = rule.when && STRING_OPERATORS[rule.when];
  if (!operator || typeof rule.value !== "string") return false;
  const passes = operator(value, rule.value, Boolean(rule.caseSensitive));
  return rule.negate ? !passes : passes;
};

const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
};

const findHighlightLevel = (ruleSet, numericValue, stringValue) => {
  const { numeric, string } = ruleSet;

  if (numeric && numericValue !== undefined) {
    const numericRules = ensureArray(numeric);
    const numericCandidates = Array.isArray(numericValue) ? numericValue : [numericValue];
    for (const candidate of numericCandidates) {
      for (const rule of numericRules) {
        if (rule?.level && evaluateNumericRule(candidate, rule)) {
          return { level: rule.level, source: "numeric", rule };
        }
      }
    }
  }

  if (string && stringValue !== undefined) {
    const stringRules = ensureArray(string);
    for (const rule of stringRules) {
      if (rule?.level && evaluateStringRule(stringValue, rule)) {
        return { level: rule.level, source: "string", rule };
      }
    }
  }

  return null;
};

export const evaluateHighlight = (fieldKey, value, highlightConfig) => {
  if (!highlightConfig || !fieldKey) return null;
  const { fields } = highlightConfig;
  if (!fields || typeof fields !== "object") return null;

  const ruleSet = fields[fieldKey];
  if (!ruleSet) return null;

  const numericValue = parseNumericValue(value);
  let stringValue;
  if (typeof value === "string") {
    stringValue = value;
  } else if (typeof value === "number" || typeof value === "bigint") {
    stringValue = String(value);
  } else if (typeof value === "boolean") {
    stringValue = value ? "true" : "false";
  }

  const normalizedString = typeof stringValue === "string" ? stringValue.trim() : stringValue;

  return findHighlightLevel(ruleSet, numericValue, normalizedString);
};

export const getHighlightClass = (level, highlightConfig) => {
  if (!level || !highlightConfig) return undefined;
  return highlightConfig.levels?.[level];
};

export const getDefaultHighlightLevels = () => DEFAULT_LEVEL_CLASSES;
