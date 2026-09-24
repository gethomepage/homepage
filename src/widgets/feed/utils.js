import sax from "sax";
import { xml2js } from "xml-js";

const asArray = (value) => (value === undefined || value === null ? [] : [].concat(value));

function getText(node) {
  const first = asArray(node)[0];
  if (first === undefined) return "";
  if (typeof first !== "object") return String(first);
  return asArray(first._cdata ?? first._text).join("");
}

export function httpUrl(value, baseUrl) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed, baseUrl);
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

const isPixel = ({ width, height }) => ["0", "1"].includes(width) || ["0", "1"].includes(height);

// first usable <img> in item html using sax tokenizer
function findHtmlImage(htmls, baseUrl) {
  for (const html of htmls) {
    if (!html) continue;
    let image = null;
    const parser = sax.parser(false, { lowercase: true });
    parser.onopentag = ({ name, attributes }) => {
      if (!image && name === "img" && !isPixel(attributes)) image = httpUrl(attributes.src, baseUrl);
    };
    parser.onerror = () => {
      parser.error = null;
      parser.resume();
    };
    parser.write(html).close();
    if (image) return image;
  }
  return null;
}

function parseRssItem(item) {
  const guid = asArray(item.guid)[0];
  const guidLink = attrs(guid).isPermaLink !== "false" ? getText(guid) : null;
  return {
    title: getText(item.title),
    link: getText(item.link) || guidLink,
    date: getText(item.pubDate) || getText(item["dc:date"]),
    image: findImage(item),
    html: [getText(item["content:encoded"]), getText(item.description)],
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
    html: [getText(entry.content), getText(entry.summary)],
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
      image: httpUrl(item.image, baseUrl) ?? findHtmlImage(item.html, baseUrl),
    }))
    .filter((item) => item.title);
}
