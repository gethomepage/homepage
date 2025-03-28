import dynamic from "next/dynamic";
import ErrorBoundary from "components/errorboundry";

const widgetMappings = {
  datetime: dynamic(() => import("components/widgets/datetime/datetime")),
  glances: dynamic(() => import("components/widgets/glances/glances")),
  greeting: dynamic(() => import("components/widgets/greeting/greeting")),
  ipify: dynamic(() => import("components/widgets/ipify/ipify")),
  kubernetes: dynamic(() => import("components/widgets/kubernetes/kubernetes")),
  logo: dynamic(() => import("components/widgets/logo/logo"), { ssr: false }),
  longhorn: dynamic(() => import("components/widgets/longhorn/longhorn")),
  openmeteo: dynamic(() => import("components/widgets/openmeteo/openmeteo")),
  openweathermap: dynamic(() => import("components/widgets/openweathermap/weather")),
  resources: dynamic(() => import("components/widgets/resources/resources")),
  search: dynamic(() => import("components/widgets/search/search")),
  stocks: dynamic(() => import("components/widgets/stocks/stocks")),
  unifi_console: dynamic(() => import("components/widgets/unifi_console/unifi_console")),
  weatherapi: dynamic(() => import("components/widgets/weather/weather")),
};

export default function Widget({ widget, style }) {
  const InfoWidget = widgetMappings[widget.type];

  if (InfoWidget) {
    return (
      <ErrorBoundary>
        <InfoWidget options={{ ...widget.options, style }} />
      </ErrorBoundary>
    );
  }

  return (
    <div className="flex-none flex flex-row items-center justify-center">
      Missing <strong>{widget.type}</strong>
    </div>
  );
}
