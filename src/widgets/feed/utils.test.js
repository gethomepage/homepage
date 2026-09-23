import { describe, expect, it } from "vitest";

import { httpUrl, parseFeed } from "./utils";

const rss = `<?xml version="1.0"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Example</title>
    <item>
      <title><![CDATA[Tom & Jerry]]></title>
      <link>https://example.com/one</link>
      <pubDate>Tue, 22 Sep 2026 10:00:00 GMT</pubDate>
      <media:thumbnail url="https://img.example.com/one.jpg" />
    </item>
    <item>
      <title>Enclosure image</title>
      <guid>https://example.com/two</guid>
      <dc:date>2026-09-21T10:00:00Z</dc:date>
      <enclosure url="/two.png" type="image/png" length="1" />
    </item>
    <item>
      <title>Audio only</title>
      <link>javascript:alert(1)</link>
      <guid isPermaLink="false">abc-123</guid>
      <enclosure url="https://example.com/three.mp3" type="audio/mpeg" length="1" />
    </item>
    <item>
      <description>No title, skipped</description>
    </item>
  </channel>
</rss>`;

const atom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <title>Example</title>
  <entry>
    <title>  Fish &amp; chips
    </title>
    <link rel="enclosure" type="image/jpeg" href="https://example.com/one.jpg" />
    <link rel="alternate" href="https://example.com/one" />
    <updated>2026-09-22T12:00:00Z</updated>
  </entry>
  <entry>
    <title>YouTube style</title>
    <link href="https://example.com/two" />
    <published>2026-09-20T12:00:00Z</published>
    <updated>not a date</updated>
    <media:group>
      <media:content url="https://example.com/two.mp4" type="video/mp4" />
      <media:thumbnail url="https://example.com/two.jpg" />
    </media:group>
  </entry>
</feed>`;

describe("widgets/feed/utils", () => {
  it("parses rss 2.0 items", () => {
    expect(parseFeed(rss, "https://example.com/feed.xml")).toEqual([
      {
        title: "Tom & Jerry",
        link: "https://example.com/one",
        date: "2026-09-22T10:00:00.000Z",
        image: "https://img.example.com/one.jpg",
      },
      {
        title: "Enclosure image",
        link: "https://example.com/two",
        date: "2026-09-21T10:00:00.000Z",
        image: "https://example.com/two.png",
      },
      { title: "Audio only", link: null, date: null, image: null },
    ]);
  });

  it("parses atom entries", () => {
    expect(parseFeed(atom, "https://example.com/atom.xml")).toEqual([
      {
        title: "Fish & chips",
        link: "https://example.com/one",
        date: "2026-09-22T12:00:00.000Z",
        image: "https://example.com/one.jpg",
      },
      {
        title: "YouTube style",
        link: "https://example.com/two",
        date: "2026-09-20T12:00:00.000Z",
        image: "https://example.com/two.jpg",
      },
    ]);
  });

  it("handles single-item and empty feeds", () => {
    const single = "<rss><channel><item><title>Only</title></item></channel></rss>";
    expect(parseFeed(single)).toEqual([{ title: "Only", link: null, date: null, image: null }]);
    expect(parseFeed("<feed></feed>")).toEqual([]);
  });

  it("rejects unsupported documents", () => {
    expect(() => parseFeed("<html><body>nope</body></html>")).toThrow("Unsupported feed format");
    expect(() => parseFeed("not xml <")).toThrow();
  });

  it.each([
    ["https://a.com/x", undefined, "https://a.com/x"],
    ["/x", "https://a.com/feed", "https://a.com/x"],
    ["data:image/png;base64,AAAA", undefined, null],
    ["not a url", undefined, null],
    ["", undefined, null],
  ])("httpUrl(%j, %j) is %j", (value, base, expected) => {
    expect(httpUrl(value, base)).toBe(expected);
  });
});
