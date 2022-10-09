import checkAndCopyConfig, { getSettings } from "utils/config/config";
import themes from "utils/styles/themes";
import { servicesResponse, bookmarksResponse } from "utils/config/api-response";

export async function getServerSideProps({ res }) {
  checkAndCopyConfig("settings.yaml");
  const settings = getSettings();
  const services = await servicesResponse();
  const bookmarks = await bookmarksResponse();

  const color = settings.color || "slate";
  const theme = settings.theme || "dark";

  const serviceShortcuts = services.map((group) =>
    group.services.map((service) => ({
      name: service.name,
      url: service.href,
      description: service.description,
    }))
  );

  const bookmarkShortcuts = bookmarks.map((group) =>
    group.bookmarks.map((service) => ({
      name: service.name,
      url: service.href,
    }))
  );

  const shortcuts = [...serviceShortcuts, ...bookmarkShortcuts].flat();

  const manifest = {
    name: settings.title || "Homepage",
    short_name: settings.title || "Homepage",
    icons: [
      {
        src: "/android-chrome-192x192.png?v=2",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png?v=2",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcuts,
    theme_color: themes[color][theme],
    background_color: themes[color][theme],
    display: "standalone",
  };

  res.setHeader("Content-Type", "application/manifest+json");
  res.write(JSON.stringify(manifest));
  res.end();

  return {
    props: {},
  };
}

export default function Webmanifest() {
  return null;
}
