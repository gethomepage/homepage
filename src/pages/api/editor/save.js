import fs from "fs";
import path from "path";

import yaml from "js-yaml";

import { CONF_DIR } from "utils/config/config";
import createLogger from "utils/logger";

const logger = createLogger("editorSave");

/**
 * POST body:
 * {
 *   draft: {
 *     bookmarks: { [groupName]: { adds: [ { name, href, abbr?, icon?, description? } ] } },
 *     services:  { [groupName]: { adds: [ { name, href, icon?, description?, ping?, siteMonitor?, widgets? } ], groups?: {} } }
 *   }
 * }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  try {
    const { draft } = req.body || {};
    if (!draft || typeof draft !== "object") return res.status(400).end("Missing draft");

    const bookmarksPath = path.join(CONF_DIR, "bookmarks.yaml");
    const servicesPath = path.join(CONF_DIR, "services.yaml");

    if (draft.bookmarks && Object.keys(draft.bookmarks).length > 0) {
      applyBookmarksDraft(bookmarksPath, draft.bookmarks);
    }

    if (draft.services && Object.keys(draft.services).length > 0) {
      applyServicesDraft(servicesPath, draft.services);
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    logger.error(e);
    return res.status(500).end(e?.message || "Internal Server Error");
  }
}

function readYamlArray(filePath) {
  const raw = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  if (!raw.trim()) return [];
  const data = yaml.load(raw);
  return Array.isArray(data) ? data : [];
}

function writeYaml(filePath, data) {
  const out = yaml.dump(data, { lineWidth: 120, noRefs: true });
  fs.writeFileSync(filePath, out, "utf8");
}

/**
 * bookmarks.yaml structure:
 * - Group:
 *   - Name:
 *     - abbr: ..
 *       href: ..
 *
 * Draft entries are render-shaped:
 * { name, href, abbr?, icon?, description? }
 *
 * Saved entries are YAML-shaped:
 * { [Name]: [ { href, abbr?, icon?, description? } ] }
 */
function applyBookmarksDraft(filePath, draftBookmarks) {
  const doc = readYamlArray(filePath);

  for (const [groupName, groupDraft] of Object.entries(draftBookmarks ?? {})) {
    const adds = groupDraft?.adds ?? [];
    const edits = groupDraft?.edits ?? {};
    const deletes = groupDraft?.deletes ?? {};
    const hasAdds = Array.isArray(adds) && adds.length > 0;
    const hasEdits = edits && Object.keys(edits).length > 0;
    const hasDeletes = deletes && Object.keys(deletes).length > 0;
    if (!hasAdds && !hasEdits && !hasDeletes) continue;

    let groupObj = doc.find(
      (g) => g && typeof g === "object" && Object.prototype.hasOwnProperty.call(g, groupName),
    );

    if (!groupObj) {
      if (!hasAdds && !hasEdits) continue;
      groupObj = { [groupName]: [] };
      doc.push(groupObj);
    }

    groupObj[groupName] = Array.isArray(groupObj[groupName]) ? groupObj[groupName] : [];
    let items = groupObj[groupName];

    if (hasDeletes) {
      items = items.filter((item) => {
        const name = item && typeof item === "object" ? Object.keys(item)[0] : null;
        return name && !deletes[name];
      });
    }

    if (hasEdits) {
      for (const [originalName, entry] of Object.entries(edits)) {
        const itemName = (entry?.name ?? "").trim();
        const href = (entry?.href ?? "").trim();
        if (!itemName || !href) continue;

        const payload = {
          href,
          ...(entry.abbr ? { abbr: entry.abbr } : {}),
          ...(entry.icon ? { icon: entry.icon } : {}),
          ...(entry.description ? { description: entry.description } : {}),
        };

        const replacement = { [itemName]: [payload] };
        const idx = items.findIndex((item) => {
          const name = item && typeof item === "object" ? Object.keys(item)[0] : null;
          return name === originalName;
        });

        if (idx >= 0) {
          items[idx] = replacement;
        } else {
          items.push(replacement);
        }
      }
    }

    if (hasAdds) {
      for (const draftItem of adds) {
        const itemName = (draftItem?.name ?? "").trim();
        const href = (draftItem?.href ?? "").trim();
        if (!itemName || !href) continue;

        const payload = {
          href,
          ...(draftItem.abbr ? { abbr: draftItem.abbr } : {}),
          ...(draftItem.icon ? { icon: draftItem.icon } : {}),
          ...(draftItem.description ? { description: draftItem.description } : {}),
        };

        items.push({ [itemName]: [payload] });
      }
    }

    groupObj[groupName] = items;
  }

  writeYaml(filePath, doc);
}

/**
 * services.yaml structure:
 * - Group:
 *   - ServiceName:
 *       href: ..
 *       icon: ..
 *       description: ..
 *       ping: ..
 *       siteMonitor: ..
 *       widgets: [ ... ]   (optional)
 *
 * Draft entries are render-shaped (Choice A):
 * { name, href, icon?, description?, ping?, siteMonitor?, widgets? }
 *
 * Saved entries must be YAML-shaped:
 * { [ServiceName]: { href, icon?, description?, ping?, siteMonitor?, widgets? } }
 */
function applyServicesDraft(filePath, groupsDraft) {
  const doc = readYamlArray(filePath);

  for (const [groupName, info] of Object.entries(groupsDraft ?? {})) {
    const adds = info?.adds ?? [];
    const edits = info?.edits ?? {};
    const deletes = info?.deletes ?? {};
    const hasAdds = Array.isArray(adds) && adds.length > 0;
    const hasEdits = edits && Object.keys(edits).length > 0;
    const hasDeletes = deletes && Object.keys(deletes).length > 0;
    if (!hasAdds && !hasEdits && !hasDeletes) continue;

    let groupObj = doc.find((o) => o && typeof o === "object" && Object.prototype.hasOwnProperty.call(o, groupName));
    if (!groupObj) {
      if (!hasAdds && !hasEdits) continue;
      groupObj = { [groupName]: [] };
      doc.push(groupObj);
    }

    groupObj[groupName] = Array.isArray(groupObj[groupName]) ? groupObj[groupName] : [];
    let items = groupObj[groupName];

    if (hasDeletes) {
      items = items.filter((item) => {
        const name = item && typeof item === "object" ? Object.keys(item)[0] : null;
        return name && !deletes[name];
      });
    }

    const buildServicePayload = (draftSvc) => {
      const payload = {
        href: draftSvc.href,
        ...(draftSvc.description ? { description: draftSvc.description } : {}),
        ...(draftSvc.icon ? { icon: draftSvc.icon } : {}),
        ...(draftSvc.ping ? { ping: draftSvc.ping } : {}),
        ...(draftSvc.siteMonitor ? { siteMonitor: draftSvc.siteMonitor } : {}),
      };

      if (Array.isArray(draftSvc.widgets) && draftSvc.widgets.length > 0) {
        payload.widgets = draftSvc.widgets;
      }
      return payload;
    };

    if (hasEdits) {
      for (const [originalName, draftSvc] of Object.entries(edits)) {
        const svcName = (draftSvc?.name ?? "").trim();
        const href = (draftSvc?.href ?? "").trim();
        if (!svcName || !href) continue;

        const svcPayload = buildServicePayload({ ...draftSvc, href });
        const replacement = { [svcName]: svcPayload };
        const idx = items.findIndex((item) => {
          const name = item && typeof item === "object" ? Object.keys(item)[0] : null;
          return name === originalName;
        });

        if (idx >= 0) {
          items[idx] = replacement;
        } else {
          items.push(replacement);
        }
      }
    }

    if (hasAdds) {
      for (const draftSvc of adds) {
        const svcName = (draftSvc?.name ?? "").trim();
        const href = (draftSvc?.href ?? "").trim();

        if (!svcName || !href) continue;

        const svcPayload = buildServicePayload({ ...draftSvc, href });
        items.push({ [svcName]: svcPayload });
      }
    }

    groupObj[groupName] = items;

    // NOTE: subgroup draft support not yet implemented here.
    // You currently store it in:
    // draft.services[groupName].groups[subgroupName].adds
    // If you want to persist subgroups, we add a second pass that merges into the correct subgroup structure.
  }

  writeYaml(filePath, doc);
}
