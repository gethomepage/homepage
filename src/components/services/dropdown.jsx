import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { BiCog } from "react-icons/bi";

export default function Dropdown({ options, state }) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-theme-600/40 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-theme-600/40 focus:outline-none">
          {state.value.label}
          <BiCog className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-theme-600/40 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {options.map((i) => (
              <Menu.Item key={i.value}>
                <button
                  onClick={() => {
                    state.set(i);
                  }}
                  type="button"
                  className="text-white block px-4 py-2 text-sm"
                >
                  {i.label}
                </button>
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
