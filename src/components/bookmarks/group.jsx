import classNames from "classnames";
import { Disclosure, Transition } from '@headlessui/react';
import { MdKeyboardArrowDown } from "react-icons/md";

import ErrorBoundary from "components/errorboundry";
import List from "components/bookmarks/list";

export default function BookmarksGroup({ group, disableCollapse }) {
  return (
    <div key={group.name} className="flex-1">
    <Disclosure defaultOpen>
    {({ open }) => (
      <>
        <Disclosure.Button disabled={disableCollapse} className="flex w-full select-none items-center group">
          <h2 className="text-theme-800 dark:text-theme-300 text-xl font-medium">{group.name}</h2>
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
