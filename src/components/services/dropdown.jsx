import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { BiCog } from "react-icons/bi";
import classNames from "classnames";

export default function Dropdown({ options, value, setValue }) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="text-xs inline-flex w-full items-center rounded bg-theme-200/50 dark:bg-theme-900/20 px-3 py-1.5">
          {options.find((option) => option.value === value).label}
          <BiCog className="-mr-1 ml-2 h-4 w-4" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-theme-200/50 dark:bg-theme-900/50 backdrop-blur shadow-md focus:outline-none text-theme-700 dark:text-theme-200">
          <div className="py-1">
            {options.map((option) => (
              <Menu.Item key={option.value} as={Fragment}>
                <button
                  onClick={() => {
                    setValue(option.value);
                  }}
                  type="button"
                  className={classNames(
                    value === option.value ? "bg-theme-300/40 dark:bg-theme-900/40" : "",
                    "w-full block px-3 py-1.5 text-sm hover:bg-theme-300/70 hover:dark:bg-theme-900/70 text-left"
                  )}
                >
                  {option.label}
                </button>
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
