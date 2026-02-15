// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

import Event, { compareDateTimezone } from "./event";

describe("widgets/calendar/event", () => {
  it("renders an anchor when a url is provided and toggles additional text on hover", () => {
    const date = DateTime.fromISO("2099-01-01T13:00:00.000Z").setZone("utc");

    render(
      <Event
        event={{
          title: "Primary",
          additional: "More info",
          date,
          color: "gray",
          url: "https://example.com",
          isCompleted: true,
        }}
        colorVariants={{ gray: "bg-gray-500" }}
        showDate
        showTime
      />,
    );

    const link = screen.getByRole("link", { name: /primary/i });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");

    // time is rendered when showTime=true
    expect(link.textContent).toContain("13:00");

    // default shows title, hover shows `additional`
    expect(screen.getByText("Primary")).toBeInTheDocument();
    expect(screen.queryByText("More info")).toBeNull();

    fireEvent.mouseEnter(link);
    expect(screen.getByText("More info")).toBeInTheDocument();

    fireEvent.mouseLeave(link);
    expect(screen.getByText("Primary")).toBeInTheDocument();

    // completed icon from react-icons renders an SVG
    expect(link.querySelector("svg")).toBeTruthy();
  });

  it("compareDateTimezone matches dates by day", () => {
    const day = DateTime.fromISO("2099-01-01T00:00:00.000Z").setZone("utc");
    expect(compareDateTimezone(day, { date: DateTime.fromISO("2099-01-01T23:59:00.000Z").setZone("utc") })).toBe(true);
    expect(compareDateTimezone(day, { date: DateTime.fromISO("2099-01-02T00:00:00.000Z").setZone("utc") })).toBe(false);
  });
});
