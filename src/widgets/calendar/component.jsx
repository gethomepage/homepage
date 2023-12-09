import { useEffect, useMemo, useState, useContext } from "react";
import dynamic from "next/dynamic";
import { DateTime } from "luxon";
import { useTranslation } from "next-i18next";

import Monthly from "./monthly";
import Agenda from "./agenda";

import Container from "components/services/widget/container";
import { SettingsContext } from "utils/contexts/settings";

const colorVariants = {
  // https://tailwindcss.com/docs/content-configuration#dynamic-class-names
  amber: "bg-amber-500",
  blue: "bg-blue-500",
  cyan: "bg-cyan-500",
  emerald: "bg-emerald-500",
  fuchsia: "bg-fuchsia-500",
  gray: "bg-gray-500",
  green: "bg-green-500",
  indigo: "bg-indigo-500",
  lime: "bg-lime-500",
  neutral: "bg-neutral-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  purple: "bg-purple-500",
  red: "bg-red-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
  slate: "bg-slate-500",
  stone: "bg-stone-500",
  teal: "bg-teal-500",
  violet: "bg-violet-500",
  white: "bg-white-500",
  yellow: "bg-yellow-500",
  zinc: "bg-zinc-500",
};

export default function Component({ service }) {
  const { widget } = service;
  const { i18n } = useTranslation();
  const [showDate, setShowDate] = useState(null);
  const [events, setEvents] = useState({});
  const currentDate = DateTime.now().setLocale(i18n.language).startOf("day");
  const { settings } = useContext(SettingsContext);

  useEffect(() => {
    if (!showDate) {
      setShowDate(currentDate);
    }
  }, [showDate, currentDate]);

  // params for API fetch
  const params = useMemo(() => {
    if (!showDate) {
      return {};
    }

    return {
      start: showDate.minus({ months: 3 }).toFormat("yyyy-MM-dd"),
      end: showDate.plus({ months: 3 }).toFormat("yyyy-MM-dd"),
      unmonitored: "false",
    };
  }, [showDate]);

  // Load active integrations
  const integrations = useMemo(
    () =>
      widget.integrations
        ?.filter((integration) => integration?.type)
        .map((integration) => ({
          service: dynamic(() => import(`./integrations/${integration.type}`)),
          widget: { ...widget, ...integration },
        })) ?? [],
    [widget],
  );

  return (
    <Container service={service}>
      <div className="flex flex-col w-full">
        <div className="sticky top-0">
          {integrations.map((integration) => {
            const Integration = integration.service;
            const key = `integration-${integration.widget.type}-${integration.widget.service_name}-${integration.widget.service_group}-${integration.widget.name}`;

            return (
              <Integration
                key={key}
                config={integration.widget}
                params={params}
                setEvents={setEvents}
                hideErrors={settings.hideErrors}
                className="fixed bottom-0 left-0 bg-red-500 w-screen h-12"
              />
            );
          })}
        </div>
        {(!widget?.view || widget?.view === "monthly") && (
          <Monthly
            key={`monthly-${showDate?.toFormat("yyyy-MM-dd")}`}
            service={service}
            colorVariants={colorVariants}
            events={events}
            showDate={showDate}
            setShowDate={setShowDate}
            className="flex"
          />
        )}
        {widget?.view === "agenda" && (
          <Agenda
            key={`agenda-${showDate?.toFormat("yyyy-MM-dd")}`}
            service={service}
            colorVariants={colorVariants}
            events={events}
            showDate={showDate}
            setShowDate={setShowDate}
            className="flex"
          />
        )}
      </div>
    </Container>
  );
}
