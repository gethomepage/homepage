export function findServiceBlockByLabel(container, label) {
  const blocks = Array.from(container.querySelectorAll(".service-block"));
  return blocks.find((b) => b.textContent?.includes(label));
}
