import { promises as fs } from "fs";
import path from "path";

import yaml from "js-yaml";

import checkAndCopyConfig from "utils/config";

export default async function handler(req, res) {
  checkAndCopyConfig("widgets.yaml");

  const widgetsYaml = path.join(process.cwd(), "config", "widgets.yaml");
  const fileContents = await fs.readFile(widgetsYaml, "utf8");
  const widgets = yaml.load(fileContents);

  // map easy to write YAML objects into easy to consume JS arrays
  const widgetsArray = widgets.map((group) => ({
    type: Object.keys(group)[0],
    options: { ...group[Object.keys(group)[0]] },
  }));

  res.send(widgetsArray);
}
