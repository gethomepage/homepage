// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PrimaryText from "./primary_text";

describe("components/widgets/widget/primary_text", () => {
  it("renders children", () => {
    render(<PrimaryText>hello</PrimaryText>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });
});
