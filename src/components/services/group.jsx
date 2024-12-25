import { useRef, useEffect } from "react";
import classNames from "classnames";
import { Disclosure, Transition } from "@headlessui/react";
import { MdKeyboardArrowDown } from "react-icons/md";

import { columnMap } from "../../utils/layout/columns";

import List from "components/services/list";
import ResolvedIcon from "components/resolvedicon";

export default function ServicesGroup({
  group,
  layout,
  fiveColumns,
  disableCollapse,
  useEqualHeights,
  groupsInitiallyCollapsed,
  isSubgroup,
}) {
  const panel = useRef();

  useEffect(() => {
    if (layout?.initiallyCollapsed ?? groupsInitiallyCollapsed) panel.current.style.height = `0`;
  }, [layout, groupsInitiallyCollapsed]);

  let groupPadding = layout?.header === false ? "px-1" : "p-1 pb-0";
  if (isSubgroup) groupPadding = "";

  return (
    <div
      key={group.name}
      className={classNames(
        "services-group flex-1",
        layout?.style === "row" ? "basis-full" : "basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4",
        layout?.style !== "row" && fiveColumns ? "3xl:basis-1/5" : "",
        groupPadding,
        isSubgroup ? "subgroup" : "",
      )}
    >
      <Disclosure defaultOpen={!(layout?.initiallyCollapsed ?? groupsInitiallyCollapsed) ?? true}>
        {({ open }) => (
          <>
            {layout?.header !== false && (
              <Disclosure.Button disabled={disableCollapse} className="flex w-full select-none items-center group">
                {layout?.icon && (
                  <div className="flex-shrink-0 mr-2 w-7 h-7 service-group-icon">
                    <ResolvedIcon icon={layout.icon} />
                  </div>
                )}
                <h2 className="flex text-theme-800 dark:text-theme-300 text-xl font-medium service-group-name">
                  {group.name}
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
                setTimeout(() => {
                  panel.current.style.height = "auto";
                }, 150); // animation is 150ms
              }}
            >
              <Disclosure.Panel className="transition-all overflow-hidden duration-300 ease-out" ref={panel} static>
                <List
                  groupName={group.name}
                  services={group.services}
                  layout={layout}
                  useEqualHeights={useEqualHeights}
                  header={layout?.header !== false}
                />
                {group.groups?.length > 0 && (
                  <div
                    className={`grid ${
                      layout?.style === "row" ? `grid ${columnMap[layout?.columns]} gap-x-2` : "flex flex-col"
                    } gap-2`}
                  >
                    {group.groups.map((subgroup) => (
                      <ServicesGroup
                        key={subgroup.name}
                        group={subgroup}
                        layout={layout?.[subgroup.name]}
                        fiveColumns={fiveColumns}
                        disableCollapse={disableCollapse}
                        useEqualHeights={useEqualHeights}
                        groupsInitiallyCollapsed={groupsInitiallyCollapsed}
                        isSubgroup
                      />
                    ))}
                  </div>
                )}
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
    </div>
  );
}
