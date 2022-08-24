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
  const servicesArray = services.map((group) => {
    return {
      name: Object.keys(group)[0],
      services: group[Object.keys(group)[0]].map((entries) => {
        return {
          name: Object.keys(entries)[0],
          ...entries[Object.keys(entries)[0]],
        };
      }),
    };
  });

  res.send(servicesArray);
}
