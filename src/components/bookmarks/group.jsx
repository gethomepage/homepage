import { Disclosure, Transition } from "@headlessui/react";
import classNames from "classnames";
import List from "components/bookmarks/list";
import ErrorBoundary from "components/errorboundry";
import ResolvedIcon from "components/resolvedicon";
import { useContext, useEffect, useRef } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { EditContext } from "utils/contexts/edit";

export default function BookmarksGroup({
  bookmarks,
  layout,
  disableCollapse,
  groupsInitiallyCollapsed,
  bookmarksStyle,
  maxGroupColumns,
}) {
  const panel = useRef();
  const { editMode, openAddEntryModal, draft } = useContext(EditContext);

  useEffect(() => {
    if (layout?.initiallyCollapsed ?? groupsInitiallyCollapsed) panel.current.style.height = `0`;
  }, [layout, groupsInitiallyCollapsed]);

  // Draft merge for this group
  const groupDraft = draft?.bookmarks?.[bookmarks.name];
  const deletes = groupDraft?.deletes ?? {};
  const edits = groupDraft?.edits ?? {};
  const adds = groupDraft?.adds ?? [];

  const mergedBookmarks = [
    ...((bookmarks.bookmarks ?? [])
      .filter((b) => b?.name && !deletes?.[b.name])
      .map((b) => {
        const edited = edits?.[b.name];
        return edited ? { ...edited, __originalName: b.name } : b;
      })),
    ...adds,
  ];

  return (
    <div
      key={bookmarks.name}
      className={classNames(
        "bookmark-group flex-1 overflow-hidden",
        layout?.style === "row" ? "basis-full" : "basis-full md:basis-1/4 lg:basis-1/5 xl:basis-1/6",
        layout?.style !== "row" && maxGroupColumns && parseInt(maxGroupColumns, 10) > 6
          ? `3xl:basis-1/${maxGroupColumns}`
          : "",
        layout?.header === false ? "px-1" : "p-1 pb-0",
      )}
    >
      <Disclosure defaultOpen={!(layout?.initiallyCollapsed ?? groupsInitiallyCollapsed) ?? true}>
        {({ open }) => (
          <>
            {layout?.header !== false && (
              <Disclosure.Button disabled={disableCollapse} className="flex w-full select-none items-center group">
                {layout?.icon && (
                  <div className="shrink-0 mr-2 w-7 h-7 bookmark-group-icon">
                    <ResolvedIcon icon={layout.icon} />
                  </div>
                )}
                <h2 className="text-theme-800 dark:text-theme-300 text-xl font-medium bookmark-group-name">
                  {bookmarks.name}
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
              }}
            >
              <Disclosure.Panel className="transition-all overflow-hidden duration-300 ease-out" ref={panel} static>
                <ErrorBoundary>
                  <List
                    groupName={bookmarks.name}
                    bookmarks={mergedBookmarks}
                    layout={layout}
                    bookmarksStyle={bookmarksStyle}
                  />

                  {editMode && (
                    <button
                      type="button"
                      onClick={() => openAddEntryModal({ type: "bookmarks", groupName: bookmarks.name })}
                      className="-mt-2 w-full cursor-pointer rounded-md border border-dashed border-black/20 dark:border-white/20 bg-transparent px-3 py-2 text-left text-sm text-theme-700 dark:text-theme-300 hover:bg-white/5 transition"
                    >
                      + Add entry
                    </button>
                  )}
                </ErrorBoundary>
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
    </div>
  );
}
