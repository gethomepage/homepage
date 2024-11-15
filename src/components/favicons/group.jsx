import { useRef, useEffect } from "react";
import classNames from "classnames";
import { Disclosure, Transition } from "@headlessui/react";
import { MdKeyboardArrowDown } from "react-icons/md";

import ErrorBoundary from "components/errorboundry";
import List from "components/favicons/list";
import ResolvedIcon from "components/resolvedicon";

export default function FaviconsGroup({ favicons, layout, disableCollapse, groupsInitiallyCollapsed }) {
  const panel = useRef();
  console.log('+++++')
  console.log(favicons)
  useEffect(() => {
    if (layout?.initiallyCollapsed ?? groupsInitiallyCollapsed) panel.current.style.height = `0`;
  }, [layout, groupsInitiallyCollapsed]);

  return (
    <div
      key={favicons.name}
      className={classNames(
        "favicon-group",
        layout?.style === "row" ? "basis-full" : "basis-full md:basis-1/4 lg:basis-1/5 xl:basis-1/6",
        layout?.header === false ? "flex-1 px-1 -my-1 overflow-hidden" : "flex-1 p-1 overflow-hidden",
      )}
    >
      <Disclosure defaultOpen={!(layout?.initiallyCollapsed ?? groupsInitiallyCollapsed) ?? true}>
        {({ open }) => (
          <>
            {layout?.header !== false && (
              <Disclosure.Button disabled={disableCollapse} className="flex w-full select-none items-center group">
                {layout?.icon && (
                  <div className="flex-shrink-0 mr-2 w-7 h-7 favicon-group-icon">
                    <ResolvedIcon icon={layout.icon} />
                  </div>
                )}
                <h2 className="text-theme-800 dark:text-theme-300 text-xl font-medium favicon-group-name">
                  {favicons.name}
                </h2>
                <MdKeyboardArrowDown
                  className={classNames(
                    disableCollapse ? "hidden" : "",
                    "transition-all opacity-0 group-hover:opacity-100 ml-auto text-theme-800 dark:text-theme-300 text-xl",
                    open ? "" : "rotate-180",
                  )}
                />
              </Disclosure.Button>
            )}
            <Transition
              // Otherwise the transition group does display: none and cancels animation
              className="!block"
              unmount={false}
              beforeLeave={() => {
                panel.current.style.height = `${panel.current.scrollHeight}px`;
                setTimeout(() => {
                  panel.current.style.height = `0`;
                }, 1);
              }}
              beforeEnter={() => {
                panel.current.style.height = `0px`;
                setTimeout(() => {
                  panel.current.style.height = `${panel.current.scrollHeight}px`;
                }, 1);
              }}
            >
              <Disclosure.Panel className="transition-all overflow-hidden duration-300 ease-out" ref={panel} static>
                <ErrorBoundary>
                  <List favicons={favicons.bookmarks} layout={layout} />
                </ErrorBoundary>
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
    </div>
  );
}
