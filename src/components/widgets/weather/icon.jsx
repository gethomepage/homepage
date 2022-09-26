import mapIcon from "utils/weather/condition-map";

export default function Icon({ condition, timeOfDay }) {
  const IconComponent = mapIcon(condition, timeOfDay);

  return <IconComponent className="w-10 h-10 text-theme-800 dark:text-theme-200" />;
}
