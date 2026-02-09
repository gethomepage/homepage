import { existsSync, readFileSync, readdirSync } from "fs";
import path from "path";

import yaml from "js-yaml";

const DOCS_ROOT = path.join(process.cwd(), "docs", "widgets");
const SERVICES_DOCS_DIR = path.join(DOCS_ROOT, "services");
const INFO_DOCS_DIR = path.join(DOCS_ROOT, "info");

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    return {};
  }

  try {
    return yaml.load(match[1]) ?? {};
  } catch {
    return {};
  }
}

function extractYamlBlocks(markdown) {
  const blocks = [];
  const regex = /```yaml\n([\s\S]*?)```/g;
  let match = regex.exec(markdown);

  while (match) {
    blocks.push(match[1]);
    match = regex.exec(markdown);
  }

  return blocks;
}

function parseYamlBlocks(markdown) {
  return extractYamlBlocks(markdown)
    .map((block) => {
      try {
        return yaml.load(block);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function extractAllowedFields(markdown) {
  const match = markdown.match(/Allowed fields:\s*`\[([^\]]*)\]`/i);
  if (!match) {
    return [];
  }

  return match[1]
    .split(",")
    .map((item) => item.replace(/['"\s]/g, ""))
    .filter(Boolean);
}

function getMarkdownFiles(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory)
    .filter((file) => file.endsWith(".md") && file !== "index.md")
    .map((file) => path.join(directory, file));
}

function readServiceWidgetCapabilities() {
  return getMarkdownFiles(SERVICES_DOCS_DIR)
    .map((filePath) => {
      const markdown = readFileSync(filePath, "utf8");
      const meta = parseFrontmatter(markdown);
      const parsedBlocks = parseYamlBlocks(markdown);

      const widgetTemplate = parsedBlocks
        .map((block) => block?.widget)
        .find((widget) => widget && typeof widget === "object" && !Array.isArray(widget) && widget.type);

      if (!widgetTemplate) {
        return null;
      }

      const { type, ...defaults } = widgetTemplate;
      if (!type) {
        return null;
      }

      const slug = path.basename(filePath, ".md");

      return {
        kind: "serviceWidget",
        slug,
        type,
        title: meta.title || type,
        description: meta.description || "",
        allowedFields: extractAllowedFields(markdown),
        defaults,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title));
}

function getInfoTemplate(parsedBlock) {
  if (Array.isArray(parsedBlock) && parsedBlock.length > 0 && parsedBlock[0] && typeof parsedBlock[0] === "object") {
    const [entry] = parsedBlock;
    const key = Object.keys(entry)[0];
    if (!key) {
      return null;
    }

    const value = entry[key];
    return {
      type: key,
      defaults: value && typeof value === "object" ? value : {},
    };
  }

  if (parsedBlock && typeof parsedBlock === "object" && !Array.isArray(parsedBlock)) {
    const keys = Object.keys(parsedBlock);
    if (keys.length !== 1) {
      return null;
    }

    const key = keys[0];
    const value = parsedBlock[key];
    return {
      type: key,
      defaults: value && typeof value === "object" ? value : {},
    };
  }

  return null;
}

function readInfoWidgetCapabilities() {
  return getMarkdownFiles(INFO_DOCS_DIR)
    .map((filePath) => {
      const markdown = readFileSync(filePath, "utf8");
      const meta = parseFrontmatter(markdown);
      const parsedBlocks = parseYamlBlocks(markdown);

      const infoTemplate = parsedBlocks.map(getInfoTemplate).find(Boolean);
      if (!infoTemplate) {
        return null;
      }

      const slug = path.basename(filePath, ".md");

      return {
        kind: "infoWidget",
        slug,
        type: infoTemplate.type,
        title: meta.title || infoTemplate.type,
        description: meta.description || "",
        defaults: infoTemplate.defaults,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getHomepageCapabilities() {
  return {
    serviceWidgets: readServiceWidgetCapabilities(),
    infoWidgets: readInfoWidgetCapabilities(),
    serviceFields: ["href", "icon", "description", "target", "ping", "siteMonitor"],
    bookmarkFields: ["href", "icon", "abbr", "description", "target"],
  };
}
