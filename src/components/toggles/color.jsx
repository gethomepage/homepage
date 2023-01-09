import { useContext, Fragment } from "react";
import { IoColorPalette } from "react-icons/io5";
import { Popover, Transition } from "@headlessui/react";
import classNames from "classnames";

import { ColorContext } from "utils/contexts/color";

const colors = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "red",
  "custom",
];

export default function ColorToggle() {
  const { color: active, setColor } = useContext(ColorContext);

  if (!active) {
    return null;
  }

  return (
    <div className="w-full self-center">
      <Popover className="relative flex items-center">
        <Popover.Button className="outline-none">
          <IoColorPalette
            className="h-5 w-5 text-theme-800 dark:text-theme-200 transition duration-150 ease-in-out"
            aria-hidden="true"
          />
          <span className="sr-only">Change color</span>
        </Popover.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel className="absolute -top-[75px] left-0">
            <div className="rounded-md shadow-lg ring-1 ring-black ring-opacity-5 w-[85vw] sm:w-full">
              <div className="relative grid gap-2 p-2 grid-cols-11 bg-white/50 dark:bg-white/10 shadow-black/10 dark:shadow-black/20 rounded-md shadow-md">
                {colors.map((color) => (
                  <button type="button" onClick={() => setColor(color)} key={color}>
                    <div
                      title={color}
                      className={classNames(
                        active === color ? "border-2" : "border-0",
                        `rounded-md w-5 h-5 border-black/50 dark:border-white/50 theme-${color} bg-theme-400`
                      )}
                    />
                    <span className="sr-only">{color}</span>
                  </button>
                ))}
              </div>
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
    </div>
  );
}
