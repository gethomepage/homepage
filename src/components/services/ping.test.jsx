// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));

vi.mock("swr", () => ({
  default: useSWR,
}));

import Ping from "./ping";

describe("components/services/ping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the ping time when the host is alive", () => {
    useSWR.mockReturnValue({ data: { alive: true, time: 123 }, error: undefined });

    render(<Ping groupName="g" serviceName="s" />);

    expect(useSWR).toHaveBeenCalledWith("/api/ping?groupName=g&serviceName=s", { refreshInterval: 30000 });
    expect(screen.getByText("123")).toBeInTheDocument();
    expect(screen.getByText("123").closest(".ping-status")).toHaveAttribute(
      "title",
      expect.stringContaining("ping.up"),
    );
  });

  it("renders a dot when style is dot", () => {
    useSWR.mockReturnValue({ data: { alive: true, time: 5 }, error: undefined });

    const { container } = render(<Ping groupName="g" serviceName="s" style="dot" />);

    expect(screen.queryByText("5")).not.toBeInTheDocument();
    expect(container.querySelector(".rounded-full")).toBeTruthy();
  });
});
