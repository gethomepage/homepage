import { join } from "path";
import { existsSync, copyFile } from "fs";

export default function checkAndCopyConfig(config) {
  const configYaml = join(process.cwd(), "config", config);
  console.log("config:", configYaml);
  if (!existsSync(configYaml)) {
    console.log("does not exist");
    const configSkeleton = join(process.cwd(), "src", "skeleton", config);
    console.log("skeleton", configSkeleton);
    copyFile(configSkeleton, configYaml, (err) => {
      if (err) {
        console.log("error copying config", err);
        throw err;
      }
      console.info("%s was copied to the config folder", config);
    });
  }
}
