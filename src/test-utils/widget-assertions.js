import { expect } from "vitest";

export function findServiceBlockByLabel(container, label) {
  const blocks = Array.from(container.querySelectorAll(".service-block"));
  return blocks.find((b) => b.textContent?.includes(label));
}

export function expectBlockValue(container, label, value) {
  const block = findServiceBlockByLabel(container, label);
  expect(block, `missing block for ${label}`).toBeTruthy();
  expect(block.textContent).toContain(String(value));
}
