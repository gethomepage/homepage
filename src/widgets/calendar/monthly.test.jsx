// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { DateTime } from "luxon";
import { describe, expect, it, vi } from "vitest";

const { EventStub, compareDateTimezoneStub } = vi.hoisted(() => ({
  EventStub: vi.fn(({ event }) => <div data-testid="event">{event.title}</div>),
  compareDateTimezoneStub: vi.fn(
    (date, event) => date.startOf("day").toISODate() === event.date.startOf("day").toISODate(),
  ),
}));

vi.mock("./event", () => ({
  default: EventStub,
  compareDateTimezone: compareDateTimezoneStub,
}));

import Monthly from "./monthly";

describe("widgets/calendar/monthly", () => {
  it("renders an empty placeholder when showDate is not set", () => {
    const { container } = render(
      <Monthly
        service={{ widget: {} }}
        colorVariants={{}}
        events={{}}
        showDate={null}
        setShowDate={() => {}}
        currentDate={DateTime.now()}
      />,
    );
    expect(container.textContent).toBe("");
  });

  it("navigates months and renders day events", () => {
    const setShowDate = vi.fn();
    const showDate = DateTime.local(2099, 2, 15).startOf("day");
    const currentDate = DateTime.local(2099, 2, 4).startOf("day");
    const service = { widget: { maxEvents: 10, showTime: false } };

    const events = {
      e1: { title: "Today Event", date: DateTime.local(2099, 2, 15, 10, 0), color: "zinc" },
      e2: { title: "Other Event", date: DateTime.local(2099, 2, 16, 10, 0), color: "zinc" },
    };

    render(
      <Monthly
        service={service}
        colorVariants={{}}
        events={events}
        showDate={showDate}
        setShowDate={setShowDate}
        currentDate={currentDate}
      />,
    );

    expect(screen.getByText("Today Event")).toBeInTheDocument();
    expect(screen.queryByText("Other Event")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: ">" }));
    expect(setShowDate).toHaveBeenCalled();
    expect(setShowDate.mock.calls[0][0].toISODate()).toBe(showDate.plus({ months: 1 }).startOf("day").toISODate());

    fireEvent.click(screen.getByRole("button", { name: "<" }));
    expect(setShowDate.mock.calls[1][0].toISODate()).toBe(showDate.minus({ months: 1 }).startOf("day").toISODate());

    fireEvent.click(screen.getByRole("button", { name: showDate.toFormat("MMMM y") }));
    expect(setShowDate.mock.calls[2][0].toISODate()).toBe(currentDate.startOf("day").toISODate());
  });
});
