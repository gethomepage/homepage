import classNames from "classnames";

export default function Block({ children }) {
  return (
    <div
      className={classNames(
        "bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center text-center p-1",
        "service-block"
      )}
    >
      {children}
    </div>
  );
}
