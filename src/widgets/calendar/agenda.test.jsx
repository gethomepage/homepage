// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { DateTime } from "luxon";
import { describe, expect, it, vi } from "vitest";

const { EventStub, compareDateTimezoneStub } = vi.hoisted(() => ({
  EventStub: vi.fn(({ event, showDate, showTime }) => (
    <div data-testid="event" data-showdate={showDate ? "1" : "0"} data-showtime={showTime ? "1" : "0"}>
      {event.title}
    </div>
  )),
  compareDateTimezoneStub: vi.fn(
    (date, event) => date.startOf("day").toISODate() === event.date.startOf("day").toISODate(),
  ),
}));

vi.mock("./event", () => ({
  default: EventStub,
  compareDateTimezone: compareDateTimezoneStub,
}));

import Agenda from "./agenda";

describe("widgets/calendar/agenda", () => {
  it("renders an empty placeholder when showDate is not set", () => {
    const { container } = render(<Agenda service={{ widget: {} }} colorVariants={{}} events={{}} showDate={null} />);
    expect(container.textContent).toBe("");
  });

  it("renders a no-events placeholder when there are no events in range", () => {
    render(<Agenda service={{ widget: {} }} colorVariants={{}} events={{}} showDate={DateTime.now()} />);
    expect(screen.getByText("calendar.noEventsToday")).toBeInTheDocument();
    expect(EventStub).toHaveBeenCalled();
  });

  it("filters by previousDays, sorts, and enforces maxEvents", () => {
    const showDate = DateTime.local(2099, 1, 2).startOf("day");
    const service = { widget: { previousDays: 0, maxEvents: 2, showTime: true } };

    const events = {
      old: { title: "Old", date: DateTime.local(2099, 1, 1, 0, 0), color: "gray" },
      a: { title: "A", date: DateTime.local(2099, 1, 2, 10, 0), color: "gray" },
      b: { title: "B", date: DateTime.local(2099, 1, 3, 10, 0), color: "gray" },
      c: { title: "C", date: DateTime.local(2099, 1, 4, 10, 0), color: "gray" },
    };

    render(<Agenda service={service} colorVariants={{}} events={events} showDate={showDate} />);

    // Old is filtered out, C is sliced out by maxEvents.
    expect(screen.queryByText("Old")).toBeNull();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.queryByText("C")).toBeNull();

    const renderedEvents = screen.getAllByTestId("event");
    expect(renderedEvents).toHaveLength(2);

    // showTime is only true for the selected day.
    const [first, second] = renderedEvents;
    expect(first).toHaveAttribute("data-showtime", "1");
    expect(second).toHaveAttribute("data-showtime", "0");
  });
});
