import { useRef } from "react";
import classNames from "classnames";
import { Disclosure, Transition } from '@headlessui/react';
import { MdKeyboardArrowDown } from "react-icons/md";

import ErrorBoundary from "components/errorboundry";
import List from "components/bookmarks/list";

export default function BookmarksGroup({ group, disableCollapse }) {
  const panel = useRef();
  return (
    <div key={group.name} className="flex-1">
    <Disclosure defaultOpen>
    {({ open }) => (
      <>
        <Disclosure.Button disabled={disableCollapse} className="flex w-full select-none items-center group">
          <h2 className="text-theme-800 dark:text-theme-300 text-xl font-medium">{group.name}</h2>
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
              <ErrorBoundary>
                <List bookmarks={group.bookmarks} />
              </ErrorBoundary>
            </Disclosure.Panel>
        </Transition>
      </>
    )}
    </Disclosure>
    </div>
  );
}
