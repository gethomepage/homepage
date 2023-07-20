import { useRef } from "react";
import classNames from "classnames";
import { Disclosure, Transition } from '@headlessui/react';
import { MdKeyboardArrowDown } from "react-icons/md";

import List from "components/services/list";
import ResolvedIcon from "components/resolvedicon";

export default function ServicesGroup({ group, services, layout, fiveColumns, disableCollapse }) {

  const panel = useRef();

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
            'transition-all opacity-0 group-hover:opacity-100 ml-auto text-theme-800 dark:text-theme-300 text-xl',
            open ? '' : 'rotate-90'
            )} />
        </Disclosure.Button>
        <Transition
          // Otherwise the transition group does display: none and cancels animation
          className="!block"
          unmount={false}
          beforeLeave={() => {
            panel.current.style.height = `${panel.current.scrollHeight}px`;
            setTimeout(() => {panel.current.style.height = `0`}, 1);
          }}
          beforeEnter={() => {
            panel.current.style.height = `0px`;
            setTimeout(() => {panel.current.style.height = `${panel.current.scrollHeight}px`}, 1);
          }}
          >
            <Disclosure.Panel className="transition-all overflow-hidden duration-300 ease-out" ref={panel} static>
              <List group={group} services={services.services} layout={layout} />
            </Disclosure.Panel>
        </Transition>
        </>
      )}
      </Disclosure>
    </div>
  );
}
