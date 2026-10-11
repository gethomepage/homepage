import { readdirSync } from "fs";

import { expect, it } from "vitest";

// Next compiles everything under src/pages into routes, so a colocated test ships
// to users and drags its dev dependencies into the runtime image.
function filesIn(dir, found = []) {
  readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) filesIn(path, found);
    else found.push(path);
  });
  return found;
}

it("keeps test files out of src/pages", () => {
  const tests = filesIn("src/pages").filter((path) => /\.(test|spec)\.[jt]sx?$/.test(path));
  expect(tests).toEqual([]);
});
