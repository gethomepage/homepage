import { Disclosure, Transition } from "@headlessui/react";
import classNames from "classnames";
import ResolvedIcon from "components/resolvedicon";
import List from "components/services/list";
import { useContext, useEffect, useRef } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { EditContext } from "utils/contexts/edit";

import { columnMap } from "../../utils/layout/columns";

export default function ServicesGroup({
  group,
  layout,
  maxGroupColumns,
  disableCollapse,
  useEqualHeights,
  groupsInitiallyCollapsed,
  isSubgroup,
}) {
  const panel = useRef();
  const { editMode, openAddEntryModal, draft } = useContext(EditContext);

  useEffect(() => {
    if (layout?.initiallyCollapsed ?? groupsInitiallyCollapsed) panel.current.style.height = `0`;
  }, [layout, groupsInitiallyCollapsed]);

  let groupPadding = layout?.header === false ? "px-1" : "p-1 pb-0";
  if (isSubgroup) groupPadding = "";

  // Draft merge for this group (top-level groups only, which matches your YAML)
  const groupDraft = draft?.services?.[group.name];
  const deletes = groupDraft?.deletes ?? {};
  const edits = groupDraft?.edits ?? {};
  const adds = groupDraft?.adds ?? [];

  const mergedServices = [
    ...((group.services ?? [])
      .filter((s) => s?.name && !deletes?.[s.name])
      .map((s) => {
        const edited = edits?.[s.name];
        return edited ? { ...edited, __originalName: s.name } : s;
      })),
    ...adds,
  ];

  return (
    <div
      key={group.name}
      className={classNames(
        "services-group flex-1",
        layout?.style === "row" ? "basis-full" : "basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4",
        layout?.style !== "row" && maxGroupColumns ? `3xl:basis-1/${maxGroupColumns}` : "",
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
                  <div className="shrink-0 mr-2 w-7 h-7 service-group-icon">
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
              className="block!"
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
                }, 150);
              }}
            >
              <Disclosure.Panel className="transition-all overflow-hidden duration-300 ease-out" ref={panel} static>
                <List
                  groupName={group.name}
                  services={mergedServices}
                  layout={layout}
                  useEqualHeights={useEqualHeights}
                  header={layout?.header !== false}
                />

                {editMode && (
                  <button
                    type="button"
                    onClick={() => openAddEntryModal({ type: "services", groupName: group.name })}
                    className="mt-0 w-full cursor-pointer rounded-md border border-dashed border-black/20 dark:border-white/20 bg-transparent px-3 py-2 text-left text-sm text-theme-700 dark:text-theme-300 hover:bg-white/5 transition"
                  >
                    + Add entry
                  </button>
                )}

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
                        maxGroupColumns={maxGroupColumns}
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
