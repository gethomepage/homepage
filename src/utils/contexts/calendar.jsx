import { createContext, useState, useMemo } from "react";

export const EventContext = createContext();
export const ShowDateContext = createContext();

export function EventProvider({ initialEvent, children }) {
  const [events, setEvents] = useState({});

  if (initialEvent) {
    setEvents(initialEvent);
  }

  const value = useMemo(() => ({ events, setEvents }), [events]);

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function ShowDateProvider({ initialDate, children }) {
  const [showDate, setShowDate] = useState(null);

  if (initialDate) {
    setShowDate(initialDate);
  }

  const value = useMemo(() => ({ showDate, setShowDate }), [showDate]);

  return <ShowDateContext.Provider value={value}>{children}</ShowDateContext.Provider>;
}
