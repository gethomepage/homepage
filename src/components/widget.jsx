import Weather from "components/widgets/weather/weather";
import Resources from "components/widgets/resources/resources";

const widgetMappings = {
  weather: Weather,
  resources: Resources,
};

export default function Widget({ widget }) {
  const ServiceWidget = widgetMappings[widget.type];

  if (ServiceWidget) {
    return <ServiceWidget options={widget.options} />;
  }

  return (
    <div className="flex-none flex flex-row items-center justify-center">
      Missing <strong>{widget.type}</strong>
    </div>
  );
}
