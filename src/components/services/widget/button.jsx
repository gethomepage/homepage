import classNames from "classnames";

export default function Button({ click, label, className = "font-thin text-sm" }) {
  return (
    <button
      type="button"
      onClick={click}
      className={classNames(
        "bg-theme-900/20 hover:bg-theme-900/35 rounded m-1 flex-1 flex flex-col items-center justify-center text-center p-1",
        "select-none cursor-pointer",
        "service-block",
      )}
    >
      <div className={className}>{label}</div>
    </button>
  );
}
