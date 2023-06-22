import classNames from "classnames";
import { Disclosure, Transition } from '@headlessui/react';
import { MdKeyboardArrowDown } from "react-icons/md";

import List from "components/services/list";
import ResolvedIcon from "components/resolvedicon";

export default function ServicesGroup({ group, services, layout, fiveColumns, disableCollapse}) {

  return (
    <div
      key={services.name}
      className={classNames(
        layout?.style === "row" ? "basis-full" : "basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4",
        layout?.style !== "row" && fiveColumns ? "3xl:basis-1/5" : "",
        "flex-1 p-1"
      )}
    >
      <Disclosure defaultOpen>
      {({ open }) => (
        <>
        <Disclosure.Button disabled={disableCollapse} className="flex w-full select-none items-center group">
          {layout?.icon &&
            <div className="flex-shrink-0 mr-2 w-7 h-7">
              <ResolvedIcon icon={layout.icon} />
            </div>
          }
          <h2 className="flex text-theme-800 dark:text-theme-300 text-xl font-medium">{services.name}</h2>
          <MdKeyboardArrowDown className={classNames(
            disableCollapse ? 'hidden' : '',
            'transition-opacity opacity-0 group-hover:opacity-100 ml-auto text-theme-800 dark:text-theme-300 text-xl',
            open ? 'rotate-180 transform' : ''
            )} />
        </Disclosure.Button>
        <Transition
          enter="transition duration-200 ease-out"
          enterFrom="transform scale-75 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-75 opacity-0"
          >
            <Disclosure.Panel>
              <List group={group} services={services.services} layout={layout} />
            </Disclosure.Panel>
        </Transition>
        </>
      )}
      </Disclosure>
    </div>
  );
}
