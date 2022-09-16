import WeatherApi from "components/widgets/weather/weather";
import OpenWeatherMap from "components/widgets/openweathermap/weather";
import Resources from "components/widgets/resources/resources";
import Search from "components/widgets/search/search";
import Greeting from "components/widgets/greeting/greeting";
import DateTime from "components/widgets/datetime/datetime";

const widgetMappings = {
  weather: WeatherApi, // This key will be deprecated in the future
  weatherapi: WeatherApi,
  openweathermap: OpenWeatherMap,
  resources: Resources,
  search: Search,
  greeting: Greeting,
  datetime: DateTime,
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
