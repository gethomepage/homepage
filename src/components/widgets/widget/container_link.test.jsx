// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ContainerLink from "./container_link";
import Raw from "./raw";

describe("components/widgets/widget/container_link", () => {
  it("renders an anchor using href or url", () => {
    const { rerender } = render(<ContainerLink options={{ href: "http://a" }} target="_self" />);
    expect(screen.getByRole("link").getAttribute("href")).toBe("http://a");
    expect(screen.getByRole("link").getAttribute("target")).toBe("_self");

    rerender(
      <ContainerLink options={{ url: "http://b" }} target="_blank">
        <Raw>
          <div>child</div>
        </Raw>
      </ContainerLink>,
    );
    expect(screen.getByRole("link").getAttribute("href")).toBe("http://b");
  });
});
