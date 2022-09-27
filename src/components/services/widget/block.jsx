import classNames from "classnames";

export default function Block({ value, label }) {
  return (
    <div
      className={classNames(
        "bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1",
        value === undefined ? "animate-pulse" : ""
      )}
    >
      <div className="font-thin text-sm">{value === undefined || value === null ? "-" : value}</div>
      <div className="font-bold text-xs uppercase">{label}</div>
    </div>
  );
}
