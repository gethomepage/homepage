import dynamic from "next/dynamic";

import ErrorBoundary from "components/errorboundry";

const widgetMappings = {
  weatherapi: dynamic(() => import("components/widgets/weather/weather")),
  openweathermap: dynamic(() => import("components/widgets/openweathermap/weather")),
  resources: dynamic(() => import("components/widgets/resources/resources")),
  search: dynamic(() => import("components/widgets/search/search")),
  greeting: dynamic(() => import("components/widgets/greeting/greeting")),
  datetime: dynamic(() => import("components/widgets/datetime/datetime")),
  logo: dynamic(() => import("components/widgets/logo/logo"), { ssr: false }),
  unifi_console: dynamic(() => import("components/widgets/unifi_console/unifi_console")),
};

export default function Widget({ widget }) {
  const InfoWidget = widgetMappings[widget.type];

  if (InfoWidget) {
    return (
      <ErrorBoundary>
        <InfoWidget options={widget.options} />
      </ErrorBoundary>
    );
  }

  return (
    <div className="flex-none flex flex-row items-center justify-center">
      Missing <strong>{widget.type}</strong>
    </div>
  );
}
