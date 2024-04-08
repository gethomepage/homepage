import classNames from "classnames";

import Event from "./event";

const colorVariants = {
  // https://tailwindcss.com/docs/content-configuration#dynamic-class-names
  amber: "bg-amber-500",
  blue: "bg-blue-500",
  cyan: "bg-cyan-500",
  emerald: "bg-emerald-500",
  fuchsia: "bg-fuchsia-500",
  gray: "bg-gray-500",
  green: "bg-green-500",
  indigo: "bg-indigo-500",
  lime: "bg-lime-500",
  neutral: "bg-neutral-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  purple: "bg-purple-500",
  red: "bg-red-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
  slate: "bg-slate-500",
  stone: "bg-stone-500",
  teal: "bg-teal-500",
  violet: "bg-violet-500",
  white: "bg-white-500",
  yellow: "bg-yellow-500",
  zinc: "bg-zinc-500",
};

export default function Agenda({ tasks }) {
  return (
    <div className="pl-1 pr-1 pb-1">
      <div className={classNames("flex flex-col", !tasks.length && "animate-pulse")}>
        {tasks.map((task) => (
          <Event
            key={task.id} // Use the unique task ID as the key
            task={task} // Pass the task object to the Event component
            colorVariants={colorVariants} // Pass color variants to Event component
          />
        ))}
      </div>
    </div>
  );
}
