import dynamic from "next/dynamic";

const widgetMappings = {
  weatherapi: dynamic(() => import("components/widgets/weather/weather")),
  openweathermap: dynamic(() => import("components/widgets/openweathermap/weather")),
  resources: dynamic(() => import("components/widgets/resources/resources")),
  search: dynamic(() => import("components/widgets/search/search")),
  greeting: dynamic(() => import("components/widgets/greeting/greeting")),
  datetime: dynamic(() => import("components/widgets/datetime/datetime")),
};

export default function Widget({ widget }) {
  const InfoWidget = widgetMappings[widget.type];

  if (InfoWidget) {
    return <InfoWidget options={widget.options} />;
  }

  return (
    <div className="flex-none flex flex-row items-center justify-center">
      Missing <strong>{widget.type}</strong>
    </div>
  );
}
