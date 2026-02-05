import { Popover, Transition } from "@headlessui/react";
import { Fragment, useContext, useEffect, useRef } from "react";
import { HiCheck, HiPencil, HiXMark } from "react-icons/hi2";
import { EditContext } from "utils/contexts/edit";

export default function EditToggle() {
  const { editMode, setEditMode, saveDraftToDisk, cancelEditing } = useContext(EditContext);
  const originalBodyPadding = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(`[homepage] editMode: ${editMode ? "ON" : "OFF"}`);

    const body = document?.body;
    if (editMode) {
      if (body && originalBodyPadding.current === null) {
        originalBodyPadding.current = body.style.paddingBottom ?? "";
      }
      if (body) body.style.paddingBottom = "calc(3.5rem + env(safe-area-inset-bottom))";
      const id = window.setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }, 50);

      return () => window.clearTimeout(id);
    }

    if (body && originalBodyPadding.current !== null) {
      body.style.paddingBottom = originalBodyPadding.current;
      originalBodyPadding.current = null;
    }
    return undefined;
  }, [editMode]);

  const enableEditMode = () => setEditMode(true);
  const cancelEditMode = () => {
    cancelEditing();
  };

  const save = async () => {
    const result = await saveDraftToDisk();
    if (!result.ok) {
      // eslint-disable-next-line no-console
      console.error("[homepage] save failed:", result.error);
      return;
    }

    // Clear draft + exit edit mode
    cancelEditing();

    // Reload to reflect saved yaml (simple and reliable for now)
    window.location.reload();
  };


  return (
    <div id="edit" className="self-center">
      <Popover className="relative flex items-center">
        {/* Pencil click enables edit mode. We do not disable edit mode here; Cancel does that. */}
        <Popover.Button
          className="outline-hidden mr-2"
          onClick={(e) => {
            // Keep interaction deterministic: clicking pencil only turns edit mode ON.
            e.preventDefault();
            if (!editMode) enableEditMode();
          }}
          aria-pressed={editMode}
        >
          <HiPencil
            className="h-5 w-5 text-theme-800 dark:text-theme-200 transition duration-150 ease-in-out"
            aria-hidden="true"
          />
          <span className="sr-only">Toggle edit mode</span>
        </Popover.Button>

        {/* Match ColorToggle’s transition exactly, but show/hide is driven by editMode */}
        <Transition
          as={Fragment}
          show={editMode}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4">
            <div className="pointer-events-auto w-full max-w-[560px] rounded-md shadow-lg ring-1 ring-black/10 dark:ring-white/10 bg-white/80 dark:bg-white/10 shadow-black/10 dark:shadow-black/20 backdrop-blur">
              <div className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="text-xs text-theme-800 dark:text-theme-200">Edit Mode Activated</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={save}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs ring-1 ring-black/10 dark:ring-white/10 hover:bg-white/10"
                  >
                    <HiCheck className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                    <span className="text-theme-800 dark:text-theme-200">Save?</span>
                  </button>

                  <button
                    type="button"
                    onClick={cancelEditMode}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs ring-1 ring-black/10 dark:ring-white/10 hover:bg-white/10"
                  >
                    <HiXMark className="h-4 w-4 text-rose-300" aria-hidden="true" />
                    <span className="text-theme-800 dark:text-theme-200">Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Popover>
    </div>
  );
}
