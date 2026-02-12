import { promises as fs } from "fs";
import path from "path";

import yaml from "js-yaml";

import checkAndCopyConfig, { CONF_DIR } from "utils/config/config";
import { widgetsFromConfig } from "utils/config/widget-helpers";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const widgets = await widgetsFromConfig();
      // Strip sensitive fields but keep everything else for editing
      const safeWidgets = widgets.map((widget) => {
        const opts = { ...widget.options };
        delete opts.index;
        delete opts.password;
        delete opts.key;
        delete opts.apiKey;
        return { type: widget.type, options: opts };
      });
      return res.status(200).json(safeWidgets);
    } catch (e) {
      return res.status(500).json({ error: "Failed to load widget configuration" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { widgets } = req.body;
      if (!Array.isArray(widgets)) {
        return res.status(400).json({ error: "widgets must be an array" });
      }

      // Read existing config to preserve sensitive fields
      let existingWidgets = [];
      try {
        existingWidgets = await widgetsFromConfig();
      } catch (e) {
        // If we can't read existing config, start fresh
      }

      // Build YAML-compatible structure
      const yamlWidgets = widgets.map((widget) => {
        const options = { ...widget.options };

        // Find matching existing widget to preserve sensitive fields
        const existing = existingWidgets.find(
          (ew) => ew.type === widget.type && ew.options?.index === widget.originalIndex,
        );
        if (existing) {
          ["password", "key", "apiKey", "username"].forEach((field) => {
            if (existing.options[field] !== undefined && options[field] === undefined) {
              options[field] = existing.options[field];
            }
          });
          // Preserve URL for non-search/glances widgets if not provided
          if (widget.type !== "search" && widget.type !== "glances") {
            if (existing.options.url !== undefined && options.url === undefined) {
              options.url = existing.options.url;
            }
          }
        }

        // Clean up empty string values
        Object.keys(options).forEach((key) => {
          if (options[key] === "") {
            delete options[key];
          }
        });

        // Handle datetime format fields specially - nest under format
        if (widget.type === "datetime") {
          const formatFields = ["dateStyle", "timeStyle", "hour12"];
          const format = {};
          formatFields.forEach((field) => {
            if (options[field] !== undefined && options[field] !== "") {
              format[field] = options[field];
              delete options[field];
            }
          });
          if (Object.keys(format).length > 0) {
            options.format = format;
          }
        }

        // Handle stocks watchlist - convert comma-separated string to array
        if (widget.type === "stocks" && typeof options.watchlist === "string") {
          options.watchlist = options.watchlist
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }

        const entry = {};
        if (Object.keys(options).length > 0) {
          entry[widget.type] = options;
        } else {
          entry[widget.type] = null;
        }
        return entry;
      });

      checkAndCopyConfig("widgets.yaml");
      const widgetsYaml = path.join(CONF_DIR, "widgets.yaml");
      const yamlStr = yaml.dump(yamlWidgets, { lineWidth: -1 });
      await fs.writeFile(widgetsYaml, `---\n${yamlStr}`, "utf8");

      // Trigger revalidation
      try {
        await res.revalidate("/");
      } catch (e) {
        // Revalidation failure is non-fatal
      }

      return res.status(200).json({ success: true });
    } catch (e) {
      console.error("Failed to save widget configuration:", e);
      return res.status(500).json({ error: "Failed to save widget configuration" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
