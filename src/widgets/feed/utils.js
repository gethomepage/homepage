import { xml2js } from "xml-js";

const asArray = (value) => (value === undefined || value === null ? [] : [].concat(value));

function getText(node) {
  const first = asArray(node)[0];
  if (first === undefined) return "";
  if (typeof first !== "object") return String(first);
  return asArray(first._cdata ?? first._text).join("");
}

export function httpUrl(value, baseUrl) {
  if (!value) return null;
  try {
    const url = new URL(value.trim(), baseUrl);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function parseDate(value) {
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

const attrs = (node) => node?._attributes ?? {};
const isImage = (node) => attrs(node).medium === "image" || attrs(node).type?.startsWith("image/");

function findImage(item) {
  const groups = [item, ...asArray(item["media:group"])];
  const candidates = [
    ...groups.flatMap((group) => asArray(group["media:thumbnail"])),
    ...groups.flatMap((group) => asArray(group["media:content"])).filter(isImage),
    ...asArray(item.enclosure).filter(isImage),
    ...asArray(item.link).filter((link) => attrs(link).rel === "enclosure" && isImage(link)),
  ];
  const image = candidates.find((node) => attrs(node).url || attrs(node).href);
  return image ? attrs(image).url || attrs(image).href : null;
}

function parseRssItem(item) {
  const guid = asArray(item.guid)[0];
  const guidLink = attrs(guid).isPermaLink !== "false" ? getText(guid) : null;
  return {
    title: getText(item.title),
    link: getText(item.link) || guidLink,
    date: getText(item.pubDate) || getText(item["dc:date"]),
    image: findImage(item),
  };
}

function parseAtomEntry(entry) {
  const links = asArray(entry.link);
  const link = links.find((l) => (attrs(l).rel ?? "alternate") === "alternate") ?? links[0];
  return {
    title: getText(entry.title),
    link: attrs(link).href,
    date: getText(entry.published) || getText(entry.updated),
    image: findImage(entry),
  };
}

export function parseFeed(xml, baseUrl) {
  const doc = xml2js(xml, { compact: true });

  let items;
  if (doc.rss) items = asArray(doc.rss.channel?.item).map(parseRssItem);
  else if (doc.feed) items = asArray(doc.feed.entry).map(parseAtomEntry);
  else throw new Error("Unsupported feed format");

  return items
    .map((item) => ({
      title: item.title.trim(),
      link: httpUrl(item.link, baseUrl),
      date: parseDate(item.date),
      image: httpUrl(item.image, baseUrl),
    }))
    .filter((item) => item.title);
}
