// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { Interface, System } = vi.hoisted(() => ({
  Interface: vi.fn(() => <div data-testid="openwrt.interface" />),
  System: vi.fn(() => <div data-testid="openwrt.system" />),
}));

vi.mock("./methods/interface", () => ({ default: Interface }));
vi.mock("./methods/system", () => ({ default: System }));

import Component from "./component";

describe("widgets/openwrt/component", () => {
  it("renders System when interfaceName is not set", () => {
    render(<Component service={{ widget: { type: "openwrt" } }} />);
    expect(screen.getByTestId("openwrt.system")).toBeInTheDocument();
  });

  it("renders Interface when interfaceName is set", () => {
    render(<Component service={{ widget: { type: "openwrt", interfaceName: "eth0" } }} />);
    expect(screen.getByTestId("openwrt.interface")).toBeInTheDocument();
  });
});
