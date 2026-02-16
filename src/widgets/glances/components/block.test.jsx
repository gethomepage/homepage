// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Block from "./block";

describe("widgets/glances/components/block", () => {
  it("renders children with the given absolute position classes", () => {
    render(
      <Block position="top-1 left-2">
        <div>hi</div>
      </Block>,
    );

    const el = screen.getByText("hi").parentElement;
    expect(el).toHaveClass("absolute");
    expect(el).toHaveClass("top-1");
    expect(el).toHaveClass("left-2");
  });
});
