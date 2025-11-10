import { getSettings } from "utils/config/config";

export async function getServerSideProps({ res }) {
  const settings = getSettings();
  const content = ["User-agent: *", !!settings.disableIndexing ? "Disallow: /" : "Allow: /"].join("\n");

  res.setHeader("Content-Type", "text/plain");
  res.write(content);
  res.end();

  return {
    props: {},
  };
}

export default function RobotsTxt() {
  // placeholder component
  return null;
}
