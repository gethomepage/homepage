import { getSettings } from "utils/config";

export default async function handler(req, res) {
  const settings = await getSettings();

  return res.send(settings);
}
