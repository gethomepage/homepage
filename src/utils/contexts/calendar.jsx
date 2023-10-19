import { createContext, useState, useMemo } from "react";

export const EventContext = createContext();

export function EventProvider({ initialEvent, children }) {
  const [events, setEvents] = useState({});

  if (initialEvent) {
    setEvents(initialEvent);
  }

  const value = useMemo(() => ({ events, setEvents }), [events]);

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}
