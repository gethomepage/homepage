import classNames from "classnames";
import { useTranslation } from "next-i18next";

export default function Pool({ name, free, allocated, healthy }) {
  const { t } = useTranslation();
  const usedPercent = Math.round((allocated / (free + allocated)) * 100);
  const statusColor = healthy ? "bg-green-500" : "bg-yellow-500";

  return (
    <div className="flex flex-row text-theme-700 dark:text-theme-200 items-center text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
      <div
        className="absolute h-5 rounded-md bg-theme-200 dark:bg-theme-900/40 z-0"
        style={{
          width: `${usedPercent}%`,
        }}
      />
      <span className="ml-2 h-2 w-2 z-10">
        <span className={classNames("block w-2 h-2 rounded-sm", statusColor)} />
      </span>
      <div className="text-xs z-10 self-center ml-2 relative h-4 grow mr-2">
        <div className="absolute w-full whitespace-nowrap text-ellipsis overflow-hidden text-left">{name}</div>
      </div>
      <div className="self-center text-xs flex justify-end mr-1.5 pl-1 z-10 text-ellipsis overflow-hidden whitespace-nowrap">
        <span>
          {`${t("common.bytes", {
            value: allocated,
            maximumFractionDigits: 1,
            binary: true,
          })} / ${t("common.bytes", {
            value: free + allocated,
            maximumFractionDigits: 1,
            binary: true,
          })}`}
        </span>
        <span className="pl-2">({usedPercent}%)</span>
      </div>
    </div>
  );
}
