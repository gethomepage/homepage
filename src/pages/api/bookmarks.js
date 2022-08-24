import { promises as fs } from "fs";
import path from "path";
import yaml from "js-yaml";
import checkAndCopyConfig from "utils/config";

export default async function handler(req, res) {
  checkAndCopyConfig("bookmarks.yaml");

  const bookmarksYaml = path.join(process.cwd(), "config", "bookmarks.yaml");
  const fileContents = await fs.readFile(bookmarksYaml, "utf8");
  const bookmarks = yaml.load(fileContents);

  // map easy to write YAML objects into easy to consume JS arrays
  const bookmarksArray = bookmarks.map((group) => {
    return {
      name: Object.keys(group)[0],
      bookmarks: group[Object.keys(group)[0]].map((entries) => {
        return {
          name: Object.keys(entries)[0],
          ...entries[Object.keys(entries)[0]][0],
        };
      }),
    };
  });

  res.send(bookmarksArray);
}
