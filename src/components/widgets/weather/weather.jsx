import useSWR from "swr";
import Icon from "./icon";

export default function Weather({ options }) {
  const { data, error } = useSWR(
    `/api/widgets/weather?lat=${options.latitude}&lon=${options.longitude}&apiKey=${options.apiKey}&duration=${options.cache}`,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  if (error) {
    return <div>failed to load</div>;
  }

  if (!data) {
    return <div className="flex flex-col items-center justify-center"></div>;
  }

  if (data.error) {
    return <div className="flex flex-col items-center justify-center"></div>;
  }

  return (
    <div className="order-last grow flex-none flex flex-row items-center justify-end">
      <Icon
        condition={data.current.condition.code}
        timeOfDay={data.current.is_day ? "day" : "night"}
      />
      <div className="flex flex-col ml-3 text-left">
        <span className="text-theme-800 dark:text-theme-200 text-sm">
          {Math.round(data.current.temp_f)}&deg;
        </span>
        <span className="text-theme-800 dark:text-theme-200 text-xs">
          {data.current.condition.text}
        </span>
      </div>
    </div>
  );
}
