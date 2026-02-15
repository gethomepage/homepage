// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { Item } = vi.hoisted(() => ({
  Item: vi.fn(({ bookmark, iconOnly }) => (
    <li data-testid="bookmark-item" data-name={bookmark.name} data-icononly={String(iconOnly)} />
  )),
}));

vi.mock("components/bookmarks/item", () => ({
  default: Item,
}));

import List from "./list";

describe("components/bookmarks/list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders items with iconOnly when iconsOnly is set", () => {
    render(<List bookmarks={[{ name: "A", href: "http://a" }]} layout={{ iconsOnly: true }} bookmarksStyle="text" />);

    expect(Item).toHaveBeenCalled();
    expect(Item.mock.calls[0][0].iconOnly).toBe(true);
  });

  it("applies gridTemplateColumns in icons style", () => {
    const { container } = render(
      <List bookmarks={[{ name: "A", href: "http://a" }]} layout={{ header: false }} bookmarksStyle="icons" />,
    );

    const ul = container.querySelector("ul");
    expect(ul.style.gridTemplateColumns).toContain("minmax(60px");
  });
});
