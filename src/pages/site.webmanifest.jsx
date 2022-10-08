import checkAndCopyConfig, { getSettings } from "utils/config/config";
import themes from "utils/styles/themes";

export async function getServerSideProps({ res }) {
  checkAndCopyConfig("settings.yaml");
  const settings = getSettings();

  const color = settings.color || "slate";
  const theme = settings.theme || "dark";

  const manifest = {
    name: "Homepage",
    short_name: "Homepage",
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
