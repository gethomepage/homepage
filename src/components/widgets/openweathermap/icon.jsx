import mapIcon from "utils/owm-condition-map";

export default function Icon({ condition, timeOfDay }) {
  const Icon = mapIcon(condition, timeOfDay);

  return <Icon className="w-10 h-10 text-theme-800 dark:text-theme-200"></Icon>;
}
