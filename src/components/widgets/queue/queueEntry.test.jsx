// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import QueueEntry from "./queueEntry";

describe("components/widgets/queue/queueEntry", () => {
  it("renders title and progress width", () => {
    const { container } = render(
      <QueueEntry title="Download" activity="Downloading" timeLeft="1m" progress={42} size="1GB" />,
    );

    expect(screen.getByText("Download")).toBeInTheDocument();
    expect(screen.getByText("1GB - Downloading - 1m")).toBeInTheDocument();

    const bar = container.querySelector("div[style]");
    expect(bar.style.width).toBe("42%");
  });
});
