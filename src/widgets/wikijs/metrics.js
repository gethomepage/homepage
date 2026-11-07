const metricFields = {
  wiki_pages_total: "pages",
  wiki_users_total: "users",
  wiki_groups_total: "groups",
};

export function parseWikiJsMetrics(data) {
  const text = Buffer.isBuffer(data) ? data.toString("utf8") : String(data ?? "");
  const result = { pages: null, users: null, groups: null };

  for (const line of text.split(/\r?\n/)) {
    const match = /^(wiki_pages_total|wiki_users_total|wiki_groups_total)\s+([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)\s*$/.exec(
      line,
    );
    if (!match) continue;

    const value = Number(match[2]);
    if (Number.isFinite(value)) result[metricFields[match[1]]] = value;
  }

  return result;
}