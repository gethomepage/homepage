import { promises as fs } from "fs";
import path from "path";

import yaml from "js-yaml";

import checkAndCopyConfig from "utils/config";

export default async function handler(req, res) {
  checkAndCopyConfig("services.yaml");

  const servicesYaml = path.join(process.cwd(), "config", "services.yaml");
  const fileContents = await fs.readFile(servicesYaml, "utf8");
  const services = yaml.load(fileContents);

  // map easy to write YAML objects into easy to consume JS arrays
  const servicesArray = services.map((group) => ({
    name: Object.keys(group)[0],
    services: group[Object.keys(group)[0]].map((entries) => {
      const { widget, ...service } = entries[Object.keys(entries)[0]];
      const result = {
        name: Object.keys(entries)[0],
        ...service,
      };

      if (widget) {
        const { type } = widget;

        result.widget = {
          type,
          service_group: Object.keys(group)[0],
          service_name: Object.keys(entries)[0],
        };
      }

      return result;
    }),
  }));

  res.send(servicesArray);
}
