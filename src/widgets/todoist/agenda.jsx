import classNames from "classnames";

import Event from "./event";

const colorVariants = {
  // Custom colors for Todoist
  "berry_red": "bg-pink-500",
  "red": "bg-red-500",
  "orange": "bg-orange-500",
  "yellow": "bg-yellow-500",
  "olive_green": "bg-green-500",
  "lime_green": "bg-lime-500",
  "green": "bg-green-500",
  "mint_green": "bg-green-400",
  "teal": "bg-teal-500",
  "sky_blue": "bg-blue-300",
  "light_blue": "bg-blue-200",
  "blue": "bg-blue-500",
  "grape": "bg-purple-500",
  "violet": "bg-purple-700",
  "lavender": "bg-purple-300",
  "magenta": "bg-pink-500",
  "salmon": "bg-red-300",
  "charcoal": "bg-gray-700",
  "grey": "bg-gray-500",
  "taupe": "bg-gray-400",
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
