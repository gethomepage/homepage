// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SecondaryText from "./secondary_text";

describe("components/widgets/widget/secondary_text", () => {
  it("renders children", () => {
    render(<SecondaryText>world</SecondaryText>);
    expect(screen.getByText("world")).toBeInTheDocument();
  });
});
