import { promises as fs } from "fs";
import path from "path";
import yaml from "js-yaml";

export async function getServiceWidget(group, service) {
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

  const serviceGroup = servicesArray.find((g) => g.name === group);
  if (serviceGroup) {
    const serviceEntry = serviceGroup.services.find((s) => s.name === service);
    if (serviceEntry) {
      const { widget } = serviceEntry;
      return widget;
    }
  }

  return false;
}
