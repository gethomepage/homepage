import checkAndCopyConfig from "utils/config";

const configs = ["docker.yaml", "settings.yaml", "services.yaml", "bookmarks.yaml"];

export default async function handler(req, res) {
  const errors = configs.map((config) => checkAndCopyConfig(config)).filter((status) => status !== true);

  res.send(errors);
}
