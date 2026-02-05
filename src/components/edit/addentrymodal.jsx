import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useContext, useEffect, useMemo, useState } from "react";
import classNames from "classnames";
import { EditContext } from "utils/contexts/edit";

const iconHelp = "Examples: mdi-home, si-github, sh-sonarr, /icons/foo.svg, https://...";

function normalizeUrl(input) {
  const raw = (input ?? "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function isValidAbsoluteUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function makeDraftId() {
  // browser-safe
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function AddEntryModal() {
  const {
    modalOpen,
    modalType,
    modalAction,
    modalGroupName,
    modalSubgroupName,
    modalInitialEntry,
    modalOriginalName,
    modalDraftId,
    closeAddEntryModal,
    draft,
    addDraftEntry,
    editDraftEntry,
    deleteDraftEntry,
  } = useContext(EditContext);

  const title = useMemo(() => {
    const base = modalType === "bookmarks" ? "bookmark" : modalType === "services" ? "service" : "entry";
    return modalAction === "edit" ? `Edit ${base}` : `Add ${base}`;
  }, [modalType, modalAction]);

  const showBookmarks = modalType === "bookmarks";
  const showServices = modalType === "services";
  const isEditing = modalAction === "edit";

  // form state
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");

  const [href, setHref] = useState("");
  const [hrefError, setHrefError] = useState("");

  const [icon, setIcon] = useState("");
  const [abbr, setAbbr] = useState("");
  const [description, setDescription] = useState("");

  const [ping, setPing] = useState("");
  const [siteMonitor, setSiteMonitor] = useState("");
  const [widgetType, setWidgetType] = useState("");
  const [widgetUrl, setWidgetUrl] = useState("");
  const [widgetKey, setWidgetKey] = useState("");

  const resetForm = () => {
    setName("");
    setNameError("");
    setHref("");
    setHrefError("");
    setIcon("");
    setAbbr("");
    setDescription("");
    setPing("");
    setSiteMonitor("");
    setWidgetType("");
    setWidgetUrl("");
    setWidgetKey("");
  };

  const onClose = () => {
    resetForm();
    closeAddEntryModal();
  };

  // Prefill when editing
  useEffect(() => {
    if (!modalOpen) return;

    setNameError("");
    setHrefError("");

    if (isEditing && modalInitialEntry) {
      setName(modalInitialEntry.name ?? "");
      setHref(modalInitialEntry.href ?? "");
      setIcon(modalInitialEntry.icon ?? "");
      setDescription(modalInitialEntry.description ?? "");

      if (showBookmarks) {
        setAbbr(modalInitialEntry.abbr ?? "");
      }

      if (showServices) {
        setPing(modalInitialEntry.ping ?? "");
        setSiteMonitor(modalInitialEntry.siteMonitor ?? "");

        // Prefill first widget (basic UX)
        const w0 = Array.isArray(modalInitialEntry.widgets) ? modalInitialEntry.widgets[0] : null;
        setWidgetType(w0?.type ?? "");
        setWidgetUrl(w0?.url ?? "");
        setWidgetKey(w0?.key ?? "");
      }

      return;
    }

    // add mode
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, isEditing, modalInitialEntry, showBookmarks, showServices]);

  // Compute names in scope for duplicate checks (excluding deleted items)
  const existingNames = useMemo(() => {
    if (!modalType || !modalGroupName) return new Set();

    if (modalType === "bookmarks") {
      const bucket = draft?.bookmarks?.[modalGroupName];
      const adds = bucket?.adds ?? [];
      const edits = bucket?.edits ?? {};
      const deletes = bucket?.deletes ?? {};

      const s = new Set();

      // adds
      for (const b of adds) {
        if (b?.name && !deletes?.[b.name]) s.add(b.name);
      }

      // edits (new name counts as existing)
      for (const [orig, updated] of Object.entries(edits)) {
        if (deletes?.[orig]) continue;
        if (updated?.name) s.add(updated.name);
        else s.add(orig);
      }

      return s;
    }

    if (modalType === "services") {
      const groupBucket = draft?.services?.[modalGroupName];
      const subgroupName = modalSubgroupName ?? null;
      const bucket = subgroupName ? groupBucket?.groups?.[subgroupName] : groupBucket;

      const adds = bucket?.adds ?? [];
      const edits = bucket?.edits ?? {};
      const deletes = bucket?.deletes ?? {};

      const s = new Set();

      for (const svc of adds) {
        if (svc?.name && !deletes?.[svc.name]) s.add(svc.name);
      }

      for (const [orig, updated] of Object.entries(edits)) {
        if (deletes?.[orig]) continue;
        if (updated?.name) s.add(updated.name);
        else s.add(orig);
      }

      return s;
    }

    return new Set();
  }, [draft, modalType, modalGroupName, modalSubgroupName]);

  const validateNameNoDuplicate = (proposedName) => {
    const proposed = (proposedName ?? "").trim();
    if (!proposed) return { ok: false, error: "Name is required." };

    // when editing: allow unchanged name (originalName) even if it exists
    const original = (modalOriginalName ?? "").trim();
    if (isEditing && proposed === original) return { ok: true };

    if (existingNames.has(proposed)) {
      return { ok: false, error: "That name already exists in this group. Choose a different name." };
    }

    return { ok: true };
  };

  const buildWidgets = () => {
    const widgets = [];
    if (widgetType || widgetUrl || widgetKey) {
      const w = {};
      if (widgetType) w.type = widgetType;

      if (widgetUrl) {
        const n = normalizeUrl(widgetUrl);
        if (!isValidAbsoluteUrl(n)) {
          return { ok: false, error: 'Widget url must be a valid URL (e.g., "https://example.com").' };
        }
        w.url = n;
      }

      if (widgetKey) w.key = widgetKey;
      widgets.push(w);
    }
    return { ok: true, widgets };
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!modalType || !modalGroupName) return;

    setNameError("");
    setHrefError("");

    // duplicate check (draft-only for now; disk duplicates are handled when we wire base list names)
    const nameCheck = validateNameNoDuplicate(name);
    if (!nameCheck.ok) {
      setNameError(nameCheck.error);
      return;
    }

    const normalizedHref = normalizeUrl(href);

    if (!normalizedHref) {
      setHrefError("URL is required.");
      return;
    }

    if (!isValidAbsoluteUrl(normalizedHref)) {
      setHrefError('Enter a valid URL (e.g., "https://example.com").');
      return;
    }

    if (modalType === "bookmarks") {
      const entry = {
        name: name.trim(),
        href: normalizedHref,
        ...(abbr ? { abbr } : {}),
        ...(icon ? { icon } : {}),
        ...(description ? { description } : {}),
      };

      if (isEditing) {
        editDraftEntry({
          type: "bookmarks",
          groupName: modalGroupName,
          originalName: modalOriginalName,
          entry,
        });
      } else {
        addDraftEntry({
          type: "bookmarks",
          groupName: modalGroupName,
          entry: { __draftId: makeDraftId(), ...entry },
        });
      }

      onClose();
      return;
    }

    if (modalType === "services") {
      const widgetsRes = buildWidgets();
      if (!widgetsRes.ok) {
        setHrefError(widgetsRes.error);
        return;
      }

      const entry = {
        name: name.trim(),
        href: normalizedHref,
        ...(description ? { description } : {}),
        ...(icon ? { icon } : {}),
        ...(ping ? { ping } : {}),
        ...(siteMonitor ? { siteMonitor } : {}),
        widgets: widgetsRes.widgets ?? [],
      };

      if (isEditing) {
        editDraftEntry({
          type: "services",
          groupName: modalGroupName,
          subgroupName: modalSubgroupName ?? null,
          originalName: modalOriginalName,
          entry,
        });
      } else {
        addDraftEntry({
          type: "services",
          groupName: modalGroupName,
          subgroupName: modalSubgroupName ?? null,
          entry: { __draftId: makeDraftId(), ...entry },
        });
      }

      onClose();
    }
  };

  const onDelete = () => {
    if (!modalType || !modalGroupName) return;

    deleteDraftEntry({
      type: modalType,
      groupName: modalGroupName,
      subgroupName: modalSubgroupName ?? null,
      originalName: modalOriginalName,
      draftId: modalDraftId ?? null,
    });

    onClose();
  };

  const showDeleteButton = isEditing && !!modalOriginalName;

  return (
    <Transition appear show={modalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Dialog.Panel className="w-full max-w-lg rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="bg-white/50 dark:bg-white/10 shadow-black/10 dark:shadow-black/20 rounded-md shadow-md p-4">
                  <Dialog.Title className="text-theme-800 dark:text-theme-200 text-base font-medium">
                    {title}
                  </Dialog.Title>

                  <div className="mt-1 text-xs text-theme-700 dark:text-theme-300">
                    {modalGroupName ? (
                      <span>
                        Group: <span className="font-medium">{modalGroupName}</span>
                        {modalSubgroupName ? (
                          <>
                            {" "}
                            / <span className="font-medium">{modalSubgroupName}</span>
                          </>
                        ) : null}
                      </span>
                    ) : null}
                  </div>

                  <form onSubmit={onSubmit} className="mt-3 space-y-3">
                    {/* Name */}
                    <div>
                      <label className="block text-xs text-theme-700 dark:text-theme-300 mb-1">Name</label>
                      <input
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (nameError) setNameError("");
                        }}
                        required
                        className="w-full rounded-md px-3 py-2 text-sm bg-white/40 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 text-theme-800 dark:text-theme-200 outline-hidden"
                        placeholder={showBookmarks ? "e.g., GitHub" : "e.g., Sonarr"}
                      />
                      {nameError ? <p className="mt-1 text-sm text-red-500">{nameError}</p> : null}
                    </div>

                    {/* Href */}
                    <div>
                      <label className="block text-xs text-theme-700 dark:text-theme-300 mb-1">Href</label>
                      <input
                        value={href}
                        onChange={(e) => {
                          setHref(e.target.value);
                          if (hrefError) setHrefError("");
                        }}
                        onBlur={() => {
                          const n = normalizeUrl(href);
                          if (n && n !== href) setHref(n);
                        }}
                        required
                        className="w-full rounded-md px-3 py-2 text-sm bg-white/40 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 text-theme-800 dark:text-theme-200 outline-hidden"
                        placeholder="https://..."
                      />
                      {hrefError ? <p className="mt-1 text-sm text-red-500">{hrefError}</p> : null}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs text-theme-700 dark:text-theme-300 mb-1">
                        Description <span className="opacity-70">(optional)</span>
                      </label>
                      <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-md px-3 py-2 text-sm bg-white/40 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 text-theme-800 dark:text-theme-200 outline-hidden"
                        placeholder="Short label shown under the name"
                      />
                    </div>

                    {/* Icon + Abbr */}
                    <div className={classNames("grid gap-3", showBookmarks ? "grid-cols-2" : "grid-cols-1")}>
                      <div>
                        <label className="block text-xs text-theme-700 dark:text-theme-300 mb-1">
                          Icon <span className="opacity-70">(optional)</span>
                        </label>
                        <input
                          value={icon}
                          onChange={(e) => setIcon(e.target.value)}
                          className="w-full rounded-md px-3 py-2 text-sm bg-white/40 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 text-theme-800 dark:text-theme-200 outline-hidden"
                          placeholder={showServices ? "mdi-home" : "si-github"}
                        />
                        <div className="mt-1 text-[11px] text-theme-600 dark:text-theme-400">{iconHelp}</div>
                      </div>

                      {showBookmarks && (
                        <div>
                          <label className="block text-xs text-theme-700 dark:text-theme-300 mb-1">
                            Abbr <span className="opacity-70">(optional)</span>
                          </label>
                          <input
                            value={abbr}
                            onChange={(e) => setAbbr(e.target.value)}
                            className="w-full rounded-md px-3 py-2 text-sm bg-white/40 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 text-theme-800 dark:text-theme-200 outline-hidden"
                            placeholder="GH"
                            maxLength={4}
                          />
                        </div>
                      )}
                    </div>

                    {/* Services advanced */}
                    {showServices && (
                      <details className="rounded-md ring-1 ring-black/10 dark:ring-white/10 p-3 bg-white/20 dark:bg-white/5">
                        <summary className="cursor-pointer select-none text-sm text-theme-800 dark:text-theme-200">
                          Advanced (optional)
                        </summary>

                        <div className="mt-3 space-y-3">
                          <div>
                            <label className="block text-xs text-theme-700 dark:text-theme-300 mb-1">
                              Ping <span className="opacity-70">(optional)</span>
                            </label>
                            <input
                              value={ping}
                              onChange={(e) => setPing(e.target.value)}
                              className="w-full rounded-md px-3 py-2 text-sm bg-white/40 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 text-theme-800 dark:text-theme-200 outline-hidden"
                              placeholder="e.g., 192.168.1.10 or https://..."
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-theme-700 dark:text-theme-300 mb-1">
                              Site Monitor <span className="opacity-70">(optional)</span>
                            </label>
                            <input
                              value={siteMonitor}
                              onChange={(e) => setSiteMonitor(e.target.value)}
                              className="w-full rounded-md px-3 py-2 text-sm bg-white/40 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 text-theme-800 dark:text-theme-200 outline-hidden"
                              placeholder="https://..."
                            />
                          </div>

                          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                            <div>
                              <label className="block text-xs text-theme-700 dark:text-theme-300 mb-1">
                                Widget type <span className="opacity-70">(optional)</span>
                              </label>
                              <input
                                value={widgetType}
                                onChange={(e) => setWidgetType(e.target.value)}
                                className="w-full rounded-md px-3 py-2 text-sm bg-white/40 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 text-theme-800 dark:text-theme-200 outline-hidden"
                                placeholder="sonarr"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-theme-700 dark:text-theme-300 mb-1">
                                Widget url <span className="opacity-70">(optional)</span>
                              </label>
                              <input
                                value={widgetUrl}
                                onChange={(e) => setWidgetUrl(e.target.value)}
                                className="w-full rounded-md px-3 py-2 text-sm bg-white/40 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 text-theme-800 dark:text-theme-200 outline-hidden"
                                placeholder="https://..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-theme-700 dark:text-theme-300 mb-1">
                                Widget key <span className="opacity-70">(optional)</span>
                              </label>
                              <input
                                value={widgetKey}
                                onChange={(e) => setWidgetKey(e.target.value)}
                                className="w-full rounded-md px-3 py-2 text-sm bg-white/40 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 text-theme-800 dark:text-theme-200 outline-hidden"
                                placeholder="apiKey"
                              />
                            </div>
                          </div>
                        </div>
                      </details>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-2">
                      {showDeleteButton ? (
                        <button
                          type="button"
                          onClick={onDelete}
                          className="rounded-md px-3 py-2 text-sm
                                     ring-1 ring-red-500/30
                                     text-red-600 dark:text-red-400
                                     hover:bg-red-500/10 transition"
                        >
                          Delete
                        </button>
                      ) : (
                        <div />
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={onClose}
                          className="rounded-md px-3 py-2 text-sm
                                     ring-1 ring-black/10 dark:ring-white/10
                                     text-theme-800 dark:text-theme-200
                                     hover:bg-white/10 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-md px-3 py-2 text-sm
                                     ring-1 ring-black/10 dark:ring-white/10
                                     text-theme-800 dark:text-theme-200
                                     hover:bg-white/10 transition"
                        >
                          {isEditing ? "Update" : "Add"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
