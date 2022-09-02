import WeatherApi from "components/widgets/weather/weather";
import OpenWeatherMap from "components/widgets/openweathermap/weather";
import Resources from "components/widgets/resources/resources";
import Search from "components/widgets/search/search";

const widgetMappings = {
  weather: WeatherApi, // This key will be deprecated in the future
  weatherapi: WeatherApi,
  openweathermap: OpenWeatherMap,
  resources: Resources,
  search: Search,
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
